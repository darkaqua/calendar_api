/**
 * Created by srpag on 11/04/17.
 */
const sql_source = require('../../../utils/sql-source');
const validators = require('../../../utils/validators');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const query = request.query;

        if(query.company_uuid === undefined){
            response.json({ valid: false, message: `La uuid de la compañia no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(query.company_uuid)){
            response.json({ valid: false, message: `La uuid de la compañia debe ser una uuid valida` });
            return;
        }
        if(query.group_id === undefined){
            response.json({ valid: false, message: `La id del grupo no puede estar vacia` });
            return;
        }
        if(isNaN(query.group_id)){
            response.json({ valid: false, message: `La id del grupo debe ser un número valido` });
            return;
        }

        global.functions.isCompanyRegistered(query.company_uuid).then((isCompanyRegistered) => {
            if(!isCompanyRegistered){
                response.json({ valid: false, message: `La compañia no existe` });
                return;
            }

            global.functions.hasUserPermissionToEditCompany(query.company_uuid, auth.user_uuid)
                .then((hasUserPermissionToEditCompany) => {
                if(!hasUserPermissionToEditCompany){
                    response.json({valid: false, message: `No tienes permisos suficientes sobre esta compañia`});
                    return;
                }

                global.functions.isCompanyGroupRegistered(query.company_uuid, query.group_id)
                    .then((isCompanyGroupRegistered) => {
                    if(!isCompanyGroupRegistered){
                        response.json({valid: false, message: `No existe este grupo dentro de la compañia`});
                        return;
                    }

                    deleteCompanyGroup(query.company_uuid, query.group_id)
                        .then((res) => response.json(res));
                });
            });
        });

    });

};

const deleteCompanyGroup = (company_uuid, group_id) => {
    return new Promise((promise_result, promise_error) => {
        const sql_conn = sql_source.connection();
        const sql_query =
            `DELETE FROM CompanyGroup 
            WHERE fk_company_uuid=${sql_conn.escape(company_uuid)} 
            AND id=${sql_conn.escape(group_id)}`;
        sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {
            promise_result({
                valid: true,
                message: `Se ha eliminado el grupo con éxito`
            });
        });
    });
};