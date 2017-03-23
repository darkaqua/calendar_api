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
        "database": "<nombre de la base de datos>"
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

## User

### RetrieveCompanyList

```
POST /User/RetrieveCompanyList
```

Devuelve una lista con información de las compañias que pertenece el usuario

Parametros

| Nombre | Tipo | Descripción |
|---|---|:--:|
| client_id | String | - |
| client_token | String | - |

Respuesta

```Json
{
    "company_list": []
}
```
```Json
{
    "company_list": [
        {
            "uuid": "b297c4e5-e9e9-4595-badb-8a93d8853cf2",
            "register_datetime": 1487865048,
            "name": "Mecano el mecánico",
            "description": "Tu mecánico de confianza",
            "email": "ayuda@mecano-el-mecanico.com",
            "whatsapp": "666777999",
            "gps": "40.741895,-73.989308"
        },
        {
            "uuid": "b297c4e5-e9e9-4595-badb-8a93d8853cf2",
            "register_datetime": 1487865048,
            "name": "Mecano el mecánico",
            "description": "Tu mecánico de confianza",
            "email": "ayuda@mecano-el-mecanico.com",
            "whatsapp": "666777999",
            "gps": "40.741895,-73.989308"
        }
    ]
}
```

## Info

### Version

```
POST /Info/Version
```

Respuesta

```Json
{
    "version": "0.0.1"
}
```

## Misc

### CountryList

```
POST /CountryList
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
