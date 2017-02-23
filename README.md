# calendar project API (not secured at all)

## Account

### Register

```
POST /Account/Register
```

Parametros

| Nombre | Tipo | Descripción |
|---|---|---|
| name | String | Nombre del usuario |
| nickname | String | Carácteres permitidos: a-Z, 0-9, _ |
| email | String | 64 chars máx |
| re_email | String | Coincidencia con Email |
| password | String | Se permite cualquier caracter, entre 8-32 chars de longitud |
| re_password | String | Coincidencia con Password |
| telephone | String | 10 chars máx |
| city | String | Limitado a lista de ciudades |
| postal_code | String | 10 chars máx |
| country | String | Limitado a lista de paises |

Respuesta
```Json
{
	"valid": true,
    "message": "Se ha enviado un mensaje de verificación a tu correo electrónico."
}
```
```Json
{
	"valid": false,
    "message": "Las contraseñas no coinciden"
}
```

### Login

```
POST /Account/Login
```

Parametros

| Nombre | Tipo | Descripción |
|---|---|:--:|
| email | String | - |
| password | String | - |

Respuesta
```Json
{
	"valid": true,
    "client_id": "c69effc00619d50fd735cb09721221b68c81f6b7bcb063df590d5bd7c68c0d7b",
    "client_token": "471acf692b08612c2a9cb219491f4610c4af824adc391239f512105a83ec2312"
}
```
```Json
{
	"valid": false,
    "message": "El correo electrónico no esta registrado."
}
```
