# Café Campus

Plataforma web para la transformación digital de una cafetería universitaria: pedidos anticipados, tablero de pedidos en la barra y reportes de ventas. Proyecto final (Momento Evaluativo 3) del curso Metodología de Software Colaborativo, Universidad Cooperativa de Colombia, Caso A.

**Sprint 1:** inicio de sesión con roles (CAF-01) y gestión del menú (CAF-02).

**Sprint 2:** registro de pedidos con turno (CAF-03), tablero de pedidos por estados (CAF-04), pedido anticipado (CAF-05) y productos agotados (CAF-07).

## Equipo

| Integrante | Rol |
| --- | --- |
| Dayanna Garcia | Product Owner y Scrum Master |
| Bleyder Martinez | Developer backend: Firebase, servicios, reglas de negocio y pruebas |
| Jeifre Salcedo | Developer frontend: pantallas, formularios y navegación |

## Tecnología

- React 18 + Vite
- Firebase Authentication (correo y contraseña; las contraseñas las cifra Firebase)
- Cloud Firestore (base de datos) con reglas de seguridad por rol

## Instalación

Requisitos: Node.js 18 o superior y un proyecto de Firebase con Authentication (correo/contraseña) y Firestore activados.

```bash
git clone https://github.com/DayannaAndrea/cafe-campus.git
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
| admin@cafecampus.test | Administradora: gestiona el menú, los precios y los productos agotados |
| cajero@cafecampus.test | Cajero: registra pedidos y los mueve en el tablero |

## Pruebas

Los casos de prueba están en la hoja «Casos de prueba» del libro de control.

## Reglas de negocio implementadas

- RN-A4: los precios se guardan como enteros, validados en la interfaz y en las reglas de Firestore.
- RN-A5: solo la administradora modifica precios, validado en la interfaz y en las reglas de Firestore.
- RN-A7: aviso de tratamiento de datos en la pantalla de inicio de sesión (Ley 1581 de 2012).

## Convenciones del equipo

- Ramas: `feature/CAF-XX-descripcion`. Si una historia tiene parte de backend y de frontend, va una rama para cada una (por ejemplo `feature/CAF-01-auth-backend` y `feature/CAF-01-login-frontend`).
- Commits: Conventional Commits con el código de la tarjeta, por ejemplo `feat(menu): validar precio entero. Refs CAF-02`.
- Todo cambio entra a `main` por Pull Request aprobado por otro integrante.

## Enlaces

- Repositorio: https://github.com/DayannaAndrea/cafe-campus
- Tablero Scrumban: https://github.com/users/DayannaAndrea/projects/7
- Carpeta compartida: https://drive.google.com/drive/folders/1brHFpaKW2RPwT4ikQ1uiLi6UXVbKZDdg?usp=drive_link
- Libro de control: carpeta compartida › `03_Control`

## Uso de asistentes de inteligencia artificial

Se usó Claude (Anthropic) como apoyo en el Sprint 1 para generar la estructura inicial del proyecto, el inicio de sesión, la gestión del menú, las reglas de Firestore, el script de datos de prueba y las pruebas automáticas. Cada integrante revisó y puede explicar el código que integra.
