const { DataTypes } = require("sequelize");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define("cliente", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    puntos: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dni:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    obraSocial:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    numeroDeAfiliado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notas: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });
};
