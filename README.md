# Proyecto Ecotec

## Descripción
Este proyecto es una prueba para Ecotec. El objetivo es demostrar las habilidades y conocimientos en desarrollo de software.
El proyecto consta de dos subproyectos que deben ser levantados para su trabajo en conjunto.
No hay que configurar la base de datos ya que este proyecto usa sqlite.
Tambien adjunto la coleccion de postman en formato JSON.

## Estructura del Proyecto
- `/api-ecodemico`: Backend del proyecto desarrollado en Laravel.
- `/ecodemico-front`: Frontend del proyecto desarrollado en Next.js con React y TypeScript.

## Requisitos
- Node.js
- npm
- PHP
- Composer

## Instalación

1. Clona el repositorio:
    ```bash
    [git clone https://github.com/gabsito/ecodemico](https://github.com/gabsito/ecodemico.git)
    ```
### Backend
1. Navega al directorio del backend:
    ```bash
    cd api-ecodemico
    ```
2. Instala las dependencias:
    ```bash
    composer install
    ```
3. Ejecuta las migraciones:
    ```bash
    php artisan migrate:fresh --seed
    ```

### Frontend
1. Navega al directorio del frontend:
    ```bash
    cd ecodemico-front
    ```
2. Instala las dependencias:
    ```bash
    npm install
    ```

## Uso

### Backend
Para iniciar el backend, ejecuta:
```bash
php artisan serve
```

### Frontend
Para iniciar el frontend, ejecuta:
```bash
npm run dev
```

## Luego de levantar el proyecto
El api de laravel la a estar levantada en `localhost:8000` y el proyecto de react en `localhost:3000`, es a esta ultima ruta que debemos ingresar visualizar y empezar a interactuar con el proyecto.

### Pantalla de Reportes
La pantalla de reportes proporciona una interfaz para visualizar y exportar información del sistema. Se divide en dos columnas principales de acciones:

#### Visualización de Reportes PDF (Columna Izquierda)
- Ver reporte Estudiantes: Muestra un resumen detallado de todos los estudiantes registrados.
- Ver reporte Inscripciones: Presenta la información de todas las inscripciones realizadas.
- Ver reporte Cursos: Despliega un listado completo de los cursos disponibles.
- Ver reporte Periodos Académicos: Muestra información sobre los períodos académicos configurados.
#### Exportación de Datos (Columna Derecha)
- Exportar Excel de estudiantes: Permite descargar la información de estudiantes en formato Excel.
- Exportar Excel de inscripciones: Genera un archivo Excel con el detalle de las inscripciones.
- Exportar Excel de cursos: Descarga la información de cursos en formato Excel.
-Exportar Excel de periodos: Permite obtener un archivo Excel con los períodos académicos.


Puedes agregar esta sección al README:

## Pantalla de Períodos Académicos
Esta pantalla permite la gestión de los períodos académicos del sistema. Presenta una interfaz con los siguientes elementos:

### Tabla Principal
Muestra los períodos académicos con las siguientes columnas:
- **ID**: Identificador único del período
- **Nombre**: Nombre o código del período (ej: 2021-1)
- **Fecha de inicio**: Fecha en que inicia el período
- **Fecha de fin**: Fecha en que termina el período

### Botones de Acción
En la parte superior de la tabla se encuentran botones que se activan al seleccionar un período:
- 🖊️ **Editar** (verde): Permite modificar la información del período seleccionado
- 🗑️ **Eliminar** (rojo): Permite eliminar el período seleccionado

### Botón de Creación
- ➕ **Nuevo período** (azul): Ubicado en la esquina superior derecha, permite crear un nuevo período académico

### Paginación
En la parte inferior de la tabla se encuentra el control de paginación que incluye:
- Navegación entre páginas (<<, <, >, >>)
- Selector de número de registros por página
- Indicador de página actual

**Nota importante**: Los botones de acción (editar y eliminar) solo se habilitan cuando se selecciona un registro de la tabla.

## Pantalla de Cursos
Esta pantalla permite la gestión de los cursos del sistema, presentando una interfaz con los siguientes elementos:

### Tabla Principal
Muestra la información detallada de los cursos con las siguientes columnas:
- **Código**: Identificador numérico único del curso (ej: 1320, 5954)
- **Nombre**: Nombre del curso (ej: sed, excepturi)
- **Docente**: Nombre del profesor asignado al curso
- **Aula**: Ubicación donde se imparte la clase
- **Día**: Día de la semana en que se dicta el curso (Lunes a Sábado)
- **Hora de inicio**: Hora en que comienza la clase (formato 24h)
- **Hora de fin**: Hora en que termina la clase (formato 24h)
- **Período**: Período académico al que pertenece (ej: 2021-1, 2021-2)

### Botones de Acción
En la parte superior de la tabla se encuentran dos botones que se activan al seleccionar un curso:
- 🖊️ **Editar** (botón verde circular): Permite modificar la información del curso seleccionado
- 🗑️ **Eliminar** (botón rojo circular): Permite eliminar el curso seleccionado

### Botón de Creación
- ➕ **Nuevo curso** (botón azul): Ubicado en la esquina superior derecha, permite agregar un nuevo curso al sistema

### Paginación
En la parte inferior de la tabla se encuentra:
- Navegación entre páginas (<<, <, números de página, >, >>)
- Selector desplegable para número de registros por página (5 registros por defecto)

**Nota**: Los botones de acción (editar y eliminar) solo se habilitan cuando se selecciona un registro de la tabla, lo que previene modificaciones accidentales.

## Pantalla de Estudiantes
Esta pantalla permite la gestión de estudiantes del sistema, presentando una interfaz con los siguientes elementos:

### Tabla Principal
Muestra la información básica de los estudiantes con las siguientes columnas:
- **Matrícula**: Número de identificación único del estudiante (ej: 922103)
- **Nombre**: Nombre completo del estudiante
- **Correo**: Dirección de correo electrónico del estudiante

### Botones de Acción
En la parte superior de la tabla se encuentran tres botones que se activan al seleccionar un estudiante:
- 🖊️ **Editar** (botón verde circular): Permite modificar la información del estudiante seleccionado
- 🗑️ **Eliminar** (botón rosa circular): Permite eliminar el estudiante seleccionado
- 👁️ **Ver Detalle** (botón celeste circular): Abre una vista detallada del estudiante seleccionado, mostrando información adicional como sus cursos inscritos

### Botón de Creación
- ➕ **Nuevo estudiante** (botón azul): Ubicado en la esquina superior derecha, permite registrar un nuevo estudiante en el sistema

### Paginación
En la parte inferior de la tabla se encuentra:
- Navegación entre páginas (<<, <, números de página, >, >>)
- Selector desplegable para número de registros por página (5 registros por defecto)

### Vista Detallada
Al hacer clic en el botón de "Ver Detalle" (👁️), se accede a una página específica del estudiante que muestra:
- Información personal del estudiante
- Lista de cursos en los que está inscrito
- Opciones para gestionar sus inscripciones

**Nota**: Como en otras secciones, los botones de acción solo se habilitan cuando se selecciona un registro de la tabla, previniendo acciones accidentales.

Aquí está la descripción de la pantalla de Inscripciones para el README:

## Pantalla de Inscripciones
Esta pantalla permite la gestión de las inscripciones de estudiantes a cursos, presentando una interfaz organizada con los siguientes elementos:

### Tabla Principal
Muestra la información de las inscripciones con las siguientes columnas:
- **ID**: Identificador único de la inscripción
- **Curso**: Nombre del curso al que se ha inscrito el estudiante
- **Estudiante**: Nombre del estudiante inscrito

### Botones de Acción
En la parte superior de la tabla se encuentran dos botones que se activan al seleccionar una inscripción:
- 🖊️ **Editar** (botón verde circular): Permite modificar la información de la inscripción seleccionada
- 🗑️ **Eliminar** (botón rosa circular): Permite eliminar la inscripción seleccionada

### Botón de Creación
- ➕ **Nueva inscripción** (botón azul): Ubicado en la esquina superior derecha, permite crear una nueva inscripción en el sistema

### Paginación
En la parte inferior de la tabla se encuentra:
- Navegación entre páginas (<<, <, números de página, >, >>)
- Selector desplegable para número de registros por página (5 registros por defecto)

**Nota**: Como en otras secciones del sistema, los botones de acción (editar y eliminar) solo se habilitan cuando se selecciona un registro de la tabla, lo que ayuda a prevenir modificaciones accidentales.

## Vista Detalle de Estudiante (Mis Cursos)
Esta pantalla muestra la información detallada de un estudiante específico y los cursos en los que está inscrito. La interfaz está diseñada para facilitar la gestión de inscripciones y acceso a reportes.

### Encabezado
- **Título**: "Mis Cursos"
- **Nombre del Estudiante**: Mostrado en el botón de reporte en la esquina superior derecha

### Botones Principales
- 📋 **Ver reporte de [Nombre del Estudiante]** (botón azul superior derecho): Genera y permite visualizar/descargar un reporte PDF con el detalle del estudiante y sus cursos
- ➕ **Inscribirme a un curso** (botón azul): Permite al estudiante inscribirse en nuevos cursos disponibles

### Tabla de Cursos Inscritos
Muestra los cursos en los que el estudiante está matriculado con las siguientes columnas:
- **Código**: Identificador único del curso
- **Nombre**: Nombre del curso
- **Docente**: Profesor que imparte el curso
- **Aula**: Ubicación donde se dicta el curso
- **Día**: Día de la semana en que se imparte
- **Hora de inicio**: Hora en que comienza la clase
- **Hora de fin**: Hora en que termina la clase

### Funcionalidades Adicionales
- 🖊️ **Editar** (botón verde): Permite modificar la información personal del estudiante
- **Paginación**: Control de navegación entre páginas con selector de registros por página

### Reporte PDF
El reporte generado incluye:
- Información personal del estudiante (nombre, matrícula)
- Lista detallada de cursos inscritos
- Total de cursos registrados

Esta vista proporciona una interfaz completa para que los estudiantes gestionen sus inscripciones y accedan a su información académica de manera eficiente.

