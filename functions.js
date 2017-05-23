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
                        sql_conn.end();
                        return;
                    }

                    const client_hash = sql_result.client_hash;

                    if(!crypt_utils.bcrypt_verify(client_token, client_hash)){
                        promise_result({ valid: false, message: err_message});
                        sql_conn.end();
                        return;
                    }

                    promise_result({ valid: true, user_uuid: sql_result.fk_user_uuid });
                    sql_conn.end();
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
                sql_conn.end();
            });
        });
    },
    isUsernameRegistered: (username) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query = `SELECT COUNT(*) AS count FROM User WHERE username=${sql_conn.escape(username)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
                sql_conn.end();
            });
        });
    },
    getUUIDFromUsername: (username) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query = `SELECT uuid FROM User WHERE username=${sql_conn.escape(username)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].uuid);
                sql_conn.end();
            });
        });
    },
    isCompanyRegistered: (company_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query = `SELECT COUNT(*) AS count FROM Company WHERE uuid=${sql_conn.escape(company_uuid)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
                sql_conn.end();
            });
        });
    },
    isGroupRegistered: (company_uuid, group_id) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query = `
            SELECT COUNT(*) AS count 
            FROM CompanyGroup 
            WHERE id=${sql_conn.escape(group_id)} 
            AND fk_company_uuid=${sql_conn.escape(company_uuid)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
                sql_conn.end();
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
                sql_conn.end();
            });
        });
    },
    isUserFromCompanyGroup: (company_uuid, group_id, user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT COUNT(*) AS count 
                FROM UserLinkedCompanyGroup 
                WHERE fk_company_uuid=${sql_conn.escape(company_uuid)}
                AND fk_group_id=${sql_conn.escape(group_id)} 
                AND fk_user_uuid=${sql_conn.escape(user_uuid)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
                sql_conn.end();
            });
        });
    },
    isUserFromCompanyGroupDate: (company_uuid, group_id, date_id, user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT COUNT(*) AS count 
                FROM UserLinkedCompanyGroupDate 
                WHERE fk_company_uuid=${sql_conn.escape(company_uuid)}
                AND fk_group_id=${sql_conn.escape(group_id)} 
                AND fk_date_id=${sql_conn.escape(date_id)} 
                AND fk_user_uuid=${sql_conn.escape(user_uuid)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
                sql_conn.end();
            });
        });
    },
    isCompanyGroupRegistered: (company_uuid, group_id) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT COUNT(*) AS count 
                FROM CompanyGroup 
                WHERE fk_company_uuid=${sql_conn.escape(company_uuid)}
                AND id=${sql_conn.escape(group_id)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
                sql_conn.end();
            });
        });
    },
    isCompanyGroupDateRegistered: (company_uuid, group_id, date_id) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT COUNT(*) AS count 
                FROM CompanyGroupDate 
                WHERE fk_company_uuid=${sql_conn.escape(company_uuid)}
                AND fk_group_id=${sql_conn.escape(group_id)} 
                AND id=${sql_conn.escape(date_id)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
                sql_conn.end();
            });
        });
    },
    isPaymentOptionAvailable: (payment_id) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT COUNT(*) AS count 
                FROM PaymentOption 
                WHERE id=${sql_conn.escape(payment_id)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
                sql_conn.end();
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
                sql_conn.end();
            });
        });
    },
    hasUserPermissionToEditCompanyGroup: (company_uuid, group_id, user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT COUNT(*) AS count 
                FROM UserLinkedCompanyGroup 
                WHERE fk_company_uuid=${sql_conn.escape(company_uuid)}
                AND fk_group_id=${sql_conn.escape(group_id)} 
                AND fk_user_uuid=${sql_conn.escape(user_uuid)}
                AND can_edit='1'`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
                sql_conn.end();
            });
        });
    },
    hasUserPermissionToEditCompanyGroupDate: (company_uuid, group_id, date_id, user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT COUNT(*) AS count 
                FROM UserLinkedCompanyGroupDate 
                WHERE fk_company_uuid=${sql_conn.escape(company_uuid)} 
                AND fk_date_id=${sql_conn.escape(date_id)} 
                AND fk_group_id=${sql_conn.escape(group_id)} 
                AND fk_user_uuid=${sql_conn.escape(user_uuid)}
                AND can_edit='1'`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count === 1);
                sql_conn.end();
            });
        });
    },
    getCompanyInfo: (company_uuid, user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT uuid, register_timestamp AS register, name, 
                description, email, telephone, address, postal_code, 
                (
                    SELECT COUNT(*) 
                    FROM UserLinkedCompany 
                    WHERE fk_company_uuid=${sql_conn.escape(company_uuid)} 
                    AND petition='1'
                ) AS members_count
                FROM Company 
                WHERE uuid=${sql_conn.escape(company_uuid)};
                SELECT can_edit 
                FROM UserLinkedCompany 
                WHERE fk_company_uuid=${sql_conn.escape(company_uuid)} 
                AND fk_user_uuid=${sql_conn.escape(user_uuid)};
                SELECT name, code
                FROM Country
                WHERE id=(
                    SELECT fk_country_id
                    FROM Company
                    WHERE uuid=${sql_conn.escape(company_uuid)}
                );`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                let company = sql_results[0][0];
                company.can_edit = sql_results[1][0].can_edit;
                company.country = sql_results[2][0];
                promise_result(company);
                sql_conn.end();
            });
        });
    },
    getCompanyGroupInfo: (company_uuid, group_id, user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT id, fk_company_uuid AS company_uuid,
                name, description, creation_timestamp AS creation
                FROM CompanyGroup
                WHERE id=${sql_conn.escape(group_id)} 
                AND fk_company_uuid=${sql_conn.escape(company_uuid)};
                SELECT can_edit
                FROM UserLinkedCompanyGroup 
                WHERE fk_group_id=${sql_conn.escape(group_id)} 
                AND fk_company_uuid=${sql_conn.escape(company_uuid)} 
                AND fk_user_uuid=${sql_conn.escape(user_uuid)};`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                let group = sql_results[0][0];
                if(sql_results[1][0] !== undefined) group.can_edit = sql_results[1][0].can_edit;
                promise_result(group);
                sql_conn.end();
            });
        });
    },
    getCompanyGroupDateInfo: (company_uuid, group_id, date_id, user_uuid) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT id, fk_group_id AS group_id, fk_company_uuid AS company_uuid,
                title, description, datetime, long_minutes 
                FROM CompanyGroupDate
                WHERE id=${sql_conn.escape(date_id)} 
                AND fk_company_uuid=${sql_conn.escape(company_uuid)};
                SELECT can_edit
                FROM UserLinkedCompanyGroupDate 
                WHERE fk_date_id=${sql_conn.escape(date_id)} 
                AND fk_group_id=${sql_conn.escape(group_id)} 
                AND fk_company_uuid=${sql_conn.escape(company_uuid)} 
                AND fk_user_uuid=${sql_conn.escape(user_uuid)};`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                let group = sql_results[0][0];
                if(sql_results[1][0] !== undefined) group.can_edit = sql_results[1][0].can_edit;
                promise_result(group);
                sql_conn.end();
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
                        sql_conn.end();
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
                    sql_conn.end();
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
                sql_conn.end();
            });
        });
    },
    getUserUUIDFromClientId: (client_id) => {
        return new Promise((promise_result, promise_error) => {
            const sql_conn = sql_source.connection();
            const query =
                `SELECT fk_user_uuid AS user_uuid
                FROM UserSession 
                WHERE client_id=${sql_conn.escape(client_id)}`;
            sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].user_uuid);
                sql_conn.end();
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
                sql_conn.end();
            });
        });
    },
    isValidDate: (datetime) => {
        const datetimeRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{1,2})$/;
        return new RegExp(datetimeRegex).test(datetime);
    }
};