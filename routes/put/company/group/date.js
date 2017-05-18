/**
 * Created by Pablo on 12/05/17.
 */
const sql_source = require('../../../../utils/sql-source');
const validators = require('../../../../utils/validators');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const body = request.body;

        //Comprobar que company_uuid esta escrita
        if(body.company_uuid === undefined){
            response.json({valid: false, message: `La uuid de la compañia no puede estar vacia`});
            return;
        }
        //Comprobar que company_uuid es valida
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({valid: false, message: `La uuid de la compañia no es valida`});
            return;
        }
        //Comprobar que group_id esta escrito
        if(body.group_id === undefined){
            response.json({valid: false, message: `La id del grupo no puede estar vacia`});
            return;
        }
        //Comprobar que group_id es un numero
        if(isNaN(body.group_id)){
            response.json({valid: false, message: `La id del grupo debe ser un numero valido`});
            return;
        }
        //Comprobar que el titulo no esta vacio
        if(body.title === undefined){
            response.json({valid: false, message: `El titulo no puede estar vacio`});
            return;
        }
        //Comprobar que el titulo tiene una longitud mayor a X
        if(body.title.length < 4|| body.title.length >= 32){
            response.json({valid: false, message: `El titulo debe contener mas de 4 caracteres y menos de 32`});
            return;
        }
        //Comprobar que la fecha no este vacia
        if(body.datetime === undefined){
            response.json({valid: false, message: `La fecha no puede estar vacia`});
            return;
        }
        //Comprobar que la fecha tenga un formato "dd/MM/yyyy hh:mm"
        if(!global.functions.isValidDate(body.datetime)){
            response.json({valid: false, message: `La fecha debe tener un formato dd/MM/yyyy hh:mm`});
            return;
        }
        //Comprobar que los minutos no estan vacios
        if(body.long_minutes === undefined){
            response.json({valid: false, message: `Los minutos de duración no pueden estar vacios`});
            return;
        }
        //Comprobar que los minutos sean numeros
        if(isNaN(body.long_minutes)){
            response.json({valid: false, message: `Los minutos de duración deben ser un número`});
            return;
        }

        //Comprobar que company_uuid existe
        global.functions.isCompanyRegistered(body.company_uuid).then((isCompanyRegistered) => {
            if (!isCompanyRegistered) {
                response.json({valid: false, message: `La compañia no existe`});
                return;
            }
            //Comprobar que group_id existe
            global.functions.isGroupRegistered(body.company_uuid, body.group_id).then(isCompanyRegistered => {
                if(!isCompanyRegistered){
                    response.json({valid: false, message: `El grupo no existe`});
                    return;
                }
                //Comprobar que tienes permisos de edición en la compañia o en el grupo
                global.functions.hasUserPermissionToEditCompanyGroup(body.company_uuid, body.group_id, auth.user_uuid)
                    .then((hasUserPermissionToEditCompanyGroup) => {

                    global.functions.hasUserPermissionToEditCompany(body.company_uuid, auth.user_uuid)
                        .then(hasUserPermissionToEditCompany => {

                        if (!hasUserPermissionToEditCompanyGroup && !hasUserPermissionToEditCompany) {
                            response.json({valid: false, message: `No tienes permisos en este grupo`});
                            return;
                        }

                        //dd/MM/yyyy hh:mm
                        const date1 = body.datetime.split(' ');
                        const date2 = date1[0].split('/');
                        const correctDateTime = `${date2[2]}-${date2[1]}-${date2[0]} ${date1[1]}`;

                        const sql_conn = sql_source.connection();
                        const query =
                            `SET @last_id = (SELECT id 
                                FROM CompanyGroupDate 
                                WHERE fk_company_uuid=${sql_conn.escape(body.company_uuid)} 
                                AND fk_group_id=${sql_conn.escape(body.group_id)} 
                                ORDER BY id DESC 
                                LIMIT 1);
                            SET @next_id = (SELECT IFNULL(@last_id + 1, 0));
                            INSERT INTO CompanyGroupDate(id, fk_group_id, fk_company_uuid, title, description, datetime, long_minutes)
                            VALUES(
                                @next_id,
                                ${sql_conn.escape(body.group_id)},
                                ${sql_conn.escape(body.company_uuid)},
                                ${sql_conn.escape(body.title)},
                                ${sql_conn.escape(body.description)},
                                ${sql_conn.escape(correctDateTime)},
                                ${sql_conn.escape(body.long_minutes)}
                            );
                            INSERT INTO UserLinkedCompanyGroupDate(fk_date_id, fk_group_id, fk_company_uuid, fk_user_uuid, can_edit)
                            VALUES(
                                @next_id,
                                ${sql_conn.escape(body.group_id)},
                                ${sql_conn.escape(body.company_uuid)},
                                ${sql_conn.escape(auth.user_uuid)},
                                '1'
                            );
                            SELECT @next_id AS date_id`;
                        sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                            response.json({ valid: true, date_id: sql_results[4][0].date_id});
                            sql_conn.end();
                        });
                    });
                });
            });
        });
    });
};