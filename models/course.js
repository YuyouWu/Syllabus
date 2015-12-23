module.exports = function (sequelize, DataTypes) {
	return sequelize.define('course', {
		
		courseName: {
			type: DataTypes.STRING,
			allowNull:false,
			validate:{
				notEmpty: true
			}
		},

		difficulty:{
			type: DataTypes.STRING,
			allowNull:false
		}
	});
};