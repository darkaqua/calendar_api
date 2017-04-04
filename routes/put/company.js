/**
 * Created by Pablo on 25/03/2017.
 */
const sql_source = require('../../utils/sql-source');
const validators = require('../../utils/validators');
const uuid = require('uuid');

/*
--------------------------------------------------------
---------------Planes----Pagos unicos-------------------
--------------------------------------------------------
PLAN 1 - FREE -> 1 compañia, 1 grupo, 1 calendario, max 3 usuarios
PLAN 2 - $$   -> 1 compañia, 5 grupos, 10 calendarios, max 100 usuario
PLAN 3 - $$$  -> 1 compañia, infinitos grupos, infintos calendarios y usuarios
--------------------------------------------------------
1 compañia -> FREE
compañia++ -> $
--------------------------------------------------------
 */
module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if(!auth.valid){
            response.json(auth);
            return;
        }

        global.functions.getUserQuota(auth.user_uuid).then((user_quota) => {
            if(user_quota.company_count === 0){
                //Excede el numero de compañias que puede tener
                response.json({valid: false, message: `No puedes crear mas compañias`});
                return;
            }
            const body = request.body;
            //name
            if(body.name === undefined){
                response.json({ valid: false, message: `El campo del nombre no puede estar vacio` });
                return;
            }
            if(body.name.length <= 4){
                response.json({ valid: false, message: `El nombre debe contener más carácteres` });
                return;
            }
            //description
            if(body.description === undefined){
                response.json({ valid: false, message: `El campo de la descripcion no puede estar vacio` });
                return;
            }
            if(body.description <= 16){
                response.json({ valid: false, message: `La descripcion debe contener más carácteres` });
                return;
            }
            //email*
            if(body.email !== undefined){
                if(!validators.verifyEmail(body.email)){
                    response.json({ valid: false, message: `El correo electrónico no es valido` });
                    return;
                }
            }
            //telephone*
            //address*
            //postal_code*
            //country_id
            const sql_conn = sql_source.connection();
            const query =
                `SELECT count(*) AS count, id AS country_id 
                FROM Country 
                WHERE code=${sql_conn.escape(body.country)}`;
            sql_conn.query(
                query,
                (sql_error, sql_results, sql_fields) => {

                    const sql_result = sql_results[0];
                    if (sql_result.count !== 1) {
                        response.json({valid: false, message: `El código de pais no es valido`});
                        return;
                    }

                    const company_uuid = uuid.v4();

                    const query =
                        `INSERT INTO Company(
                        uuid, name, description,
                        email, telephone, address,
                        postal_code, fk_country_id)
                        VALUES (
                        ${sql_conn.escape(company_uuid)},
                        ${sql_conn.escape(body.name)},
                        ${sql_conn.escape(body.description)},
                        ${sql_conn.escape(body.email === undefined ? '' : body.email)},
                        ${sql_conn.escape(body.telephone === undefined ? '' : body.telephone)},
                        ${sql_conn.escape(body.address === undefined ? '' : body.address)},
                        ${sql_conn.escape(body.postal_code === undefined ? '' : body.postal_code)},
                        ${sql_conn.escape(sql_result.country_id)}
                        );
                        INSERT INTO UserLinkedCompany(fk_company_uuid, fk_user_uuid, can_edit, petition)
                        VALUES (
                        ${sql_conn.escape(company_uuid)},
                        ${sql_conn.escape(auth.user_uuid)},
                        '1',
                        '1'
                        )`;
                    sql_conn.query(query,(err) => {
                        response.json({ valid: true, company_uuid: company_uuid });
                    });
                }
            );
        });

    });
};