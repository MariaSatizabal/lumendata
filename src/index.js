const app = require('./app');

app.listen(app.get('port'), () => {
    console.log('=====================================================================');
    console.log(`Servicio corriendo en el puerto ${app.get('port')}`);
    console.log('=====================================================================');
})