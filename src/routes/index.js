const { Router } = require("express");
const axios = require('axios');
const { Cliente, Producto, ObraSocial } = require("../db");

const router = Router();

// FUNCIONES CONTROLADORAS:

const getDbInfo = async () => {
  return await Cliente.findAll({
    include: {                      
      model: ObraSocial,            //esto es para que me traiga la obra social del cliente.
      attributes: ['nombre'],     //solo quiero la variable nombre
      through:{
        attributes: [],
      }
    }
  })
}

const getProductosDb = async () => {
  return await Producto.findAll();
}

const getObrasSocialesDb = async () => {
  return await ObraSocial.findAll();
}


// Configurar los routers
// ENDPOINTS:

// GET/clientes y GET/clientes?nombre=...
router.get('/clientes', async (req, res) =>{
  const nombre = req.query.nombre;            //permite tomar valores de la url /clientes?nombre=...

  let clientesTotal = await getDbInfo();

  if(nombre){
    let nombreCliente = await clientesTotal.filter(el => el.nombre.toLowerCase().includes(nombre.toLowerCase()));
    let apellidoCliente = await clientesTotal.filter(el => el.apellido.toLowerCase().includes(nombre.toLowerCase()));
    
    if(nombreCliente.length){  
      res.status(200).send(nombreCliente) 
    }else if(apellidoCliente.length){
      res.status(200).send(apellidoCliente) 
    } else {
      res.status(404).send('cliente no encontrado.');
    }
    
  } else {
    clientesTotal.length ? 
    res.status(200).send(clientesTotal) :
    res.status(404).send('no se encontraron clientes en la base de datos.');
  }

});



// GET/clientes/:id
router.get('/clientes/:id', async (req, res) => {
  const id = req.params.id;
  const clientesTotal = await getDbInfo();

  if(id){
    let clienteId = await clientesTotal.filter(el => el.id == id);

    if(clienteId.length){

      res.status(200).send(clienteId);

    }else{

      res.status(404).send('No se encontró ese cliente.');

    }
  }
});

// POST/cliente
router.post('/cliente', async (req, res) =>{
  let { nombre, apellido, puntos, dni, numeroDeAfiliado, direccion, telefono, obraSocial } = req.body;

try{
  
  let clienteCreado = await Cliente.create({ nombre, apellido, puntos, dni, numeroDeAfiliado, direccion, telefono });
 
  if(obraSocial && obraSocial.length > 0){
    let obraSocialDb = await ObraSocial.findAll({
      where: { 
        nombre: obraSocial 
      }
    });
    
    if (obraSocialDb.length === 0) {
      return res.status(404).send("Algunas obras sociales no fueron encontradas");
    }
    
    await clienteCreado.addObraSocials(obraSocialDb);
  };
    
    res.send('cliente creado con éxito!');
  
  
}catch(error){
  console.log(error);
  res.status(500).send('error interno del servidor')
}

});


// DELETE/cliente/:id                                     Para probar la ruta omitir el caracter : 
router.delete('/cliente/:id', async (req, res) => {
  const { id } = req.params;

  try {

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).send(`Cliente con id ${id} no encontrado.`);
    }

    await cliente.destroy();

    res.status(200).send(`Cliente con id ${id} eliminado con éxito.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al intentar eliminar el cliente.');
  }
});

// PUT/cliente/:id
router.put('/cliente/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, puntos, dni, numeroDeAfiliado, direccion, telefono, obraSocial } = req.body;

  try {

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).send(`Cliente con id ${id} no encontrado.`);
    }

    await cliente.update({
      nombre,
      apellido,
      puntos,
      dni,
      numeroDeAfiliado,
      direccion,
      telefono
    });

    let obraSocialDb = await ObraSocial.findAll({
      where: { nombre: obraSocial }
    });

    await cliente.setObraSocials(obraSocialDb);

    res.status(200).send(`Cliente con id ${id} actualizado con éxito.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al intentar actualizar el cliente.');
  }
});

// GET/obrassociales

router.get('/obras-sociales', async (req, res) => {
  const nombre = req.query.nombre;            //permite tomar valores de la url /obras-sociales?nombre=...
  
  let obrasSocialesTotal = await getObrasSocialesDb();
  if(nombre){
    let nombreObraSocial = await obrasSocialesTotal.filter(el => el.nombre.toLowerCase().includes(nombre.toLowerCase()));

    if(nombreObraSocial.length){
      res.status(200).send(nombreObraSocial)
    } else {
      res.status(404).send('obra social no encontrada.');
    }
  } else {
    obrasSocialesTotal.length ?
    res.status(200).send(obrasSocialesTotal) :
    res.status(404).send('No se encontraron obras sociales en la base de datos.')
  }
  
});



// POST/obrasocial

router.post('/obrasocial', async (req, res) =>{
  let { nombre } = req.body;
try {
  await ObraSocial.create({nombre});
  res.send('Obra Social creada con éxito!');
  
} catch (error) {
  res.status(404).send("Error al crear la obra social.");
}
});


// DELETE/obrasocial/:id                                     Para probar la ruta omitir el caracter : 
router.delete('/obrasocial/:id', async (req, res) => {
  const { id } = req.params;

  try {

    const obraSocial = await ObraSocial.findByPk(id);

    if (!obraSocial) {
      return res.status(404).send(`Obra Social con id ${id} no encontrada.`);
    }

    await obraSocial.destroy();

    res.status(200).send(`Obra Social con id ${id} eliminada con éxito.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al intentar eliminar la obra social.');
  }
});

// PUT/obrasocial/:id
router.put('/obrasocial/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  const obraSocial = await ObraSocial.findByPk(id);

  if(!obraSocial){
    res.status(404).send('Obra social no encontrada.')
  }

  await obraSocial.update({ nombre });

  res.status(200).send(`Obra Social con id ${id} actualizado con éxito.`);

});

// GET/obras-sociales/:id
router.get('/obras-sociales/:id', async (req, res) => {
  const id = req.params.id;
  const obrasSocialesTotal = await getObrasSocialesDb();

  if(id){
    let obraSocialId = await obrasSocialesTotal.filter(el => el.id == id);

    if(obraSocialId.length){

      res.status(200).send(obraSocialId);

    }else{

      res.status(404).send('No se encontró esa obra social.');

    }
  }
});

// GET/productos
router.get('/productos', async (req, res) =>{
  
  let productosTotal = await getProductosDb();

  if(productosTotal.length > 0){

    res.status(200).send(productosTotal);

  } else {
    
    res.status(404).send('No se encontraon productos.');

  }
});

// POST/producto
router.post('/producto', async (req, res) => {
  let { nombre } = req.body;

  await Producto.create({nombre});
  res.send('Producto creado con éxito!');
});


module.exports = router;
