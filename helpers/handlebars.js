const Handlebars = require('handlebars');

module.exports = {
    seleccionarSkills : (seleccionadas = [], opciones) =>{

        // Limpiar las habilidades seleccionadas de saltos de línea y espacios
        seleccionadas = seleccionadas.map(skill => skill.trim());
        // console.log(seleccionadas)
        const skills=[
            'HTML5', 'CCS3','CCSGrid', 'Flexbox','JavaScript', 'jQuery', 'Node JS','Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP',
            'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQl', 'MVC', 'SASS', 'WordPress'
        ];
        let html = '';
        skills.forEach(skill => {
            html += `
            <li ${seleccionadas.includes(skill) ? ' class="activo"' : ''}>${skill}</skill>
            `;
        });
        return opciones.fn().html = html;
    },
    tipoContrato:(seleccionado, opciones)=>{
        return opciones.fn(this).replace(
            new RegExp(` value="${seleccionado}"`), '$& selected="selected"'
        )
    },

    mostrarAlertas: (errores = {}, alertas) => {
        let html = '';
        const categorias = Object.keys(errores);
    
        if (categorias.length) {
            categorias.forEach(categoria => {
                // Verificamos que errores[categoria] sea un array
                if (Array.isArray(errores[categoria])) {
                    errores[categoria].forEach(error => {
                        html += `<div class="${categoria} alerta">${error}</div>`;
                    });
                } else {
                    // Si no es un array, podemos manejarlo de alguna manera
                    html += `<div class="${categoria} alerta">${errores[categoria]}</div>`;
                }
            });
        }
    
        return new Handlebars.SafeString(html);
    }
    
    
}