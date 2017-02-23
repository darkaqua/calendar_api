# calendar project API (not secured at all)

## Account

### Register

```
POST /Account/Register
```

Parametros
| Nombre | Tipo | Descripción |
|--|--|--|
| Name | String | Nombre del usuario |
| Nickname | String | Carácteres permitidos: a-Z, 0-9, _ |
| Email | String | 64 chars máx |
| ReEmail | String | Coincidencia con Email |
| Password | String | Se permite cualquier caracter, entre 8-32 chars de longitud |
| RePassword | String | Coincidencia con Password |
| Telephone | String | 10 chars máx |
| City | String | Limitado a lista de ciudades |
| PostalCode | String | 10 chars máx |
| Country | String | Limitado a lista de paises |

Respuesta
```Json
{
	"Valid": true,
    "Message": "Se ha enviado un mensaje de verificación a tu correo electrónico."
}
```
```Json
{
	"Valid": false,
    "Message": "Las contraseñas no coinciden"
}
```
