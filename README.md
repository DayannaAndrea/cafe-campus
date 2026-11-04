# Café Campus

Plataforma web para la transformación digital de una cafetería universitaria: pedidos anticipados, tablero de pedidos en la barra y reportes de ventas. Proyecto final (Momento Evaluativo 3) del curso Metodología de Software Colaborativo, Universidad Cooperativa de Colombia, Caso A.

**Versión actual:** v0.1-sprint1 · inicio de sesión con roles (CAF-01) y gestión del menú (CAF-02).

## Equipo

| Integrante | Rol |
| --- | --- |
| Dikson Ned Cantillo Rojas | Product Owner y Scrum Master |
| [Compañero 1] | Developer · CAF-01 |
| [Compañero 2] | Developer · CAF-02 |

## Tecnología

- React 18 + Vite
- Firebase Authentication (correo y contraseña; las contraseñas las cifra Firebase)
- Cloud Firestore (base de datos) con reglas de seguridad por rol

## Instalación

Requisitos: Node.js 18 o superior y un proyecto de Firebase con Authentication (correo/contraseña) y Firestore activados.

```bash
git clone https://github.com/<usuario>/cafe-campus.git
cd cafe-campus
npm install
cp .env.example .env        # llenar con los datos de la app web de Firebase
```

Publicar las reglas de seguridad: en la consola de Firebase › Firestore › Reglas, pegar el contenido de `firestore.rules` y publicar.

Cargar los datos de prueba (6 productos y 2 usuarios):

1. Consola de Firebase › Configuración del proyecto › Cuentas de servicio › Generar nueva clave privada. Guardarla como `serviceAccount.json` en la raíz (está en `.gitignore`).
2. Escribir en `.env` las contraseñas `SEED_ADMIN_PASSWORD` y `SEED_CAJERO_PASSWORD` (mínimo 6 caracteres).
3. Ejecutar:

```bash
npm run seed
npm run dev
```

Abrir http://localhost:5173.

| Usuario de prueba | Rol |
| --- | --- |
| admin@cafecampus.test | Administradora: agrega y edita productos |
| cajero@cafecampus.test | Cajero: consulta el menú |

## Pruebas

```bash
npm test
```

Los casos de prueba manuales están en la hoja «Casos de prueba» del libro de control.

## Reglas de negocio implementadas

- RN-A4: los precios se guardan como enteros, validados en la interfaz y en las reglas de Firestore.
- RN-A5: solo la administradora modifica precios, validado en la interfaz y en las reglas de Firestore.
- RN-A7: aviso de tratamiento de datos en la pantalla de inicio de sesión (Ley 1581 de 2012).

## Convenciones del equipo

- Ramas: `feature/CAF-XX-descripcion`.
- Commits: Conventional Commits con el código de la tarjeta, por ejemplo `feat(menu): validar precio entero. Refs CAF-02`.
- Todo cambio entra a `main` por Pull Request aprobado por otro integrante.

## Enlaces

- Tablero Scrumban: [enlace]
- Carpeta compartida: [enlace]
- Libro de control: [enlace]
- Canal de Discord: [enlace]

## Uso de asistentes de inteligencia artificial

Se usó Claude (Anthropic) como apoyo para generar la estructura inicial del proyecto, el formulario del menú y las reglas de Firestore. Cada integrante revisó y puede explicar el código que integra.
