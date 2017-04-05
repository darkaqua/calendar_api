/**
 * Created by pablo on 24/3/17.
 */
const sql_source = require('./utils/sql-source');
const crypt_utils = require('./utils/crypt-utils');

const e = global.functions = {
    authRequest: (request) => {
        return new Promise((promise_result, promise_error) => {
            const client_id = request.headers.client_id;
            const client_token = request.headers.client_token;

            const sql_conn = sql_source.connection();
            const query =
                `SELECT fk_user_uuid, client_hash 
                FROM UserSession 
                WHERE valid='1' AND DATE_ADD(creation,INTERVAL 30 DAY) > NOW()
                AND client_id=${sql_conn.escape(client_id)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                    const sql_result = sql_results[0];
                    const err_message = "No se ha podido verificar la autenticidad del cliente";

                    if(sql_result === undefined){
                        promise_result({ valid: false, message: err_message});
                        return;
                    }

                    const client_hash = sql_result.client_hash;

                    if(!crypt_utils.bcrypt_verify(client_token, client_hash)){
                        promise_result({ valid: false, message: err_message});
                        return;
                    }

                    promise_result({ valid: true, user_uuid: sql_result.fk_user_uuid });
                }
            );
        });
    },
    isUserUUIDRegistered: (uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query = `SELECT COUNT(*) AS count FROM User WHERE uuid=${sql_conn.escape(uuid)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
            });
        });
    },
    isUsernameRegistered: (username) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query = `SELECT COUNT(*) AS count FROM User WHERE username=${sql_conn.escape(username)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
            });
        });
    },
    getUUIDFromUsername: (username) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query = `SELECT uuid FROM User WHERE username=${sql_conn.escape(username)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].uuid);
            });
        });
    },
    isCompanyRegistered: (company_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query = `SELECT COUNT(*) AS count FROM Company WHERE uuid=${sql_conn.escape(company_uuid)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
            });
        });
    },
    isUserFromCompany: (company_uuid, user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT COUNT(*) AS count 
                FROM UserLinkedCompany 
                WHERE fk_company_uuid=${sql_conn.escape(company_uuid)}
                AND fk_user_uuid=${sql_conn.escape(user_uuid)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
            });
        });
    },
    hasUserPermissionToEditCompany: (company_uuid, user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT COUNT(*) AS count 
                FROM UserLinkedCompany 
                WHERE fk_company_uuid=${sql_conn.escape(company_uuid)}
                AND fk_user_uuid=${sql_conn.escape(user_uuid)}
                AND can_edit='1'`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
            });
        });
    },
    getCompanyInfo: (company_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT co.uuid AS company_uuid, 
                co.register_timestamp AS company_register, 
                co.name AS company_name, 
                co.description AS company_description, 
                co.email AS company_email, 
                co.telephone AS company_telephone, 
                co.address AS company_address, 
                co.postal_code AS company_pc, 
                cu.name AS country_name, 
                cu.code AS country_code,
                (
                    SELECT COUNT(*) 
                    FROM UserLinkedCompany 
                    WHERE fk_company_uuid=${sql_conn.escape(company_uuid)} 
                    AND petition='1'
                ) AS company_members_count
                FROM Company co 
                JOIN Country cu
                ON cu.id=fk_country_id
                WHERE uuid=${sql_conn.escape(company_uuid)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                const sql_result = sql_results[0];
                const company = {
                    uuid: sql_result.company_uuid,
                    register: sql_result.company_register,
                    name: sql_result.company_name,
                    description: sql_result.company_description,
                    email: sql_result.company_email,
                    telephone: sql_result.company_telephone,
                    address: sql_result.company_address,
                    postal_code: sql_result.company_pc,
                    members_count: sql_result.company_members_count,
                    country: {
                        name: sql_result.country_name,
                        code: sql_result.country_code
                    }
                };
                promise_result(company);
            });
        });
    },
    getUserInfo: (user_uuid, pub = false) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT u.name, u.username, u.telephone, u.city, 
                u.postal_code, u.email, u.register_timestamp, 
                c.name AS country_name, c.code AS country_code 
                FROM User u 
                JOIN Country c 
                ON u.fk_country_id = c.id 
                WHERE uuid=${sql_conn.escape(user_uuid)}`;
            sql_conn.query(
                query,
                (sql_error, sql_results, sql_fields) => {
                    let sql_result = sql_results[0];
                    //El contenido del usuario es publico
                    if(!pub){
                        const content = {
                            uuid: user_uuid,
                            name: sql_result.name,
                            username: sql_result.username,
                            register_timestamp: sql_result.register_timestamp
                        };
                        promise_result(content);
                        return;
                    }
                    //El contenido del usuario es privado
                    const country = {
                        name: sql_result.country_name,
                        code: sql_result.country_code
                    };
                    sql_result.uuid = user_uuid;
                    sql_result.country_name = sql_result.country_code = undefined;
                    sql_result.country = country;
                    promise_result(sql_result);
                }
            );
        });
    },
    getUserQuota: (user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            e.getUserMaxQuota(user_uuid).then(user_max_quota => {
                e.getUserCurrentQuota(user_uuid).then(user_current_quota => {
                    promise_result({
                        company_count: user_max_quota.company_count - user_current_quota.company_count,
                        group_count: user_max_quota.group_count - user_current_quota.group_count,
                        user_count: user_max_quota.user_count - user_current_quota.user_count
                    });
                });
            });
        });
    },
    getUserMaxQuota: (user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT COALESCE(SUM(company_count), (SELECT company_count FROM PaymentOption WHERE id=1)) AS company_count, 
                COALESCE(SUM(group_count), (SELECT group_count FROM PaymentOption WHERE id=1)) AS group_count, 
                COALESCE(SUM(user_count), (SELECT user_count FROM PaymentOption WHERE id=1)) AS user_count 
                FROM PaymentOption 
                JOIN UserPayment 
                ON fk_payment_option_id=id
                WHERE DATE_ADD(timestamp, INTERVAL 30 DAY) > NOW()
                AND fk_user_uuid=${sql_conn.escape(user_uuid)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0])
            });
        });
    },
    getUserCurrentQuota: (user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `#Recuento de compañias que tiene el usuario
                SELECT count(*) AS company_count
                FROM UserLinkedCompany 
                WHERE fk_user_uuid=${sql_conn.escape(user_uuid)}
                AND can_edit='1';
                #Recuento de Grupos asociados al usuario
                SELECT count(*) AS group_count
                FROM UserLinkedCompanyGroup 
                WHERE fk_user_uuid=${sql_conn.escape(user_uuid)}
                AND can_edit='1';
                #Recuento de usuarios a cargo de las compañias del usuario
                SELECT COUNT(*) - 
                (
                    SELECT COUNT(*) 
                    FROM UserLinkedCompany 
                    WHERE can_edit='1' 
                    AND fk_user_uuid=${sql_conn.escape(user_uuid)}
                ) AS user_count 
                FROM UserLinkedCompany 
                WHERE fk_company_uuid 
                IN 
                (
                    SELECT fk_company_uuid 
                    FROM UserLinkedCompany 
                    WHERE can_edit='1' 
                    AND fk_user_uuid=${sql_conn.escape(user_uuid)}
                );`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result({
                    company_count: sql_results[0][0].company_count,
                    group_count: sql_results[1][0].group_count,
                    user_count: sql_results[2][0].user_count
                });
            });
        });
    }
};