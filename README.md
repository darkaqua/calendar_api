[![Build Status](https://travis-ci.org/darkaqua/calendar_api.svg?branch=develop)](https://travis-ci.org/darkaqua/calendar_api)

# calendar project API (not secured at all)

## carpeta 'private'

### - config.json

```JSON
{
    "api": {
        "ip": "<ip>",
        "port": <puerto>
    },
    "db": {
        "host": "<url de la base de datos>",
        "user": "<nombre del usuario>",
        "password": "<contraseña>",
        "database": "<nombre de la base de datos>",
        "multipleStatements": true|false
    }
}
```

## Account

### Register

```
POST /Account/Register
```

Parametros

| - | Nombre | Tipo | Descripción |
|---|---|---|---|
| | name | String | Nombre del usuario |
| | username | String | Carácteres permitidos: a-Z, 0-9, _ |
| | email | String | 64 chars máx |
| | re_email | String | Coincidencia con Email |
| | password | String | Se permite cualquier caracter, entre 8-32 chars de longitud |
| | re_password | String | Coincidencia con Password |
|-| telephone | String | 10 chars máx |
|-| city | String | Limitado a lista de ciudades |
|-| postal_code | String | 10 chars máx |
| | country | String | Limitado a lista de paises |

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

## Company

### User-Permissions

```
POST /Company/User-Permissions
```

Respuesta

```Json
[
    {
        "id": 1,
        "desription": "owner"
    },
    {
        "id": 2,
        "desription": "administrator"
    }
]
```

### Create

```
POST /Company/Create
```

Parametros

| - | Nombre | Tipo | Descripción |
|---|---|---|---|
| | name | String | Nombre de la compañia |
| | description | String | Descripcion de la compañia |
|-| email | String | Correo electronico de contacto de la compañia |
|-| telephone | String | 10 chars máx |
|-| address | String | Direccion de la compañia |
|-| city | String | Limitado a lista de ciudades |
|-| postal_code | String | 10 chars máx |
| | country | String | Limitado a lista de paises |

Respuesta

```Json
{
    "valid": true,
    "company_uuid": "4c06fdfc-fcdd-4ace-acc0-dd8774d5f273"
}
```

```Json
{
    "valid": false,
    "message": "No puedes crear mas compañias"
}
```

### Invitation

#### Invite

```
POST /Company/Invitation/Invite
```

Parametros

| Nombre | Tipo | Descripción |
|---|---|---|
| company_uuid | UUID | Identificador de la compañia |
| username | String | Nombre unico del usuario |
| permission | int | Numero de permiso que se puede asignar |

Respuesta

```Json
{
    "valid": true,
    "message": "Se ha enviado la solicitud a Test1!"
}
```

#### Response

```
POST /Company/Invitation/Response
```

Parametros

| Nombre | Tipo | Descripción |
|---|---|---|
| company_uuid | UUID | Identificador de la compañia |
| response | boolean | - |

Response

```JSON
{
    "valid": false,
    "message": "La solcitud no existe"
}
```

## User

```
GET /User
```

Parametros

| Nombre | Tipo | Descripción |
|---|---|:--:|
| uuid | UUID | UUID del usuario del que se quiere recuperar informacion |

Respuesta

(Respuesta desde el mismo usuario)
```Json
{
    "valid": true,
    "user_uuid": "96d211ac-a7dd-4301-983d-2b386c227a11",
    "content": {
        "name": "Pablo G.",
        "username": "pagoru",
        "telephone": "666777888",
        "city": "",
        "postal_code": "",
        "email": "pagoru@gmail.com",
        "register_timestamp": "2017-03-22T15:58:47.000Z",
        "country": {
            "name": "España",
            "code": "ES"
        }
    }
}
```

(Respuesta desde otro usuario)
```Json
{
    "valid": true,
    "user_uuid": "96d211ac-a7dd-4301-983d-2b386c227a11",
    "content": {
        "name": "afeafas",
        "username": "pagoru2",
        "register_timestamp": "2017-03-23T14:52:27.000Z"
    }
}
```


### Search

```
GET /User/Search
```

Parametros

| Nombre | Tipo | Descripción |
|---|---|:--:|
| username | String | Parte del nombre de usuario |

Respuesta

```Json
[
    "pagoru1",
    "test1"
]
```

## Info

### Version

```
GET /Info/Version
```

Respuesta

```Json
{
    "version": "0.0.1"
}
```

## Misc

### Country-List

```
GET /Country-List
```

Respuesta

```Json
[
    {
        "name": "España",
        "code": "ES"
    },
    {
        "name": "Francia",
        "code": "FR"
    }
]
```
