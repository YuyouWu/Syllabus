module.exports = function (sequelize, DataTypes) {
	return sequelize.define('comment', {

		content:{
			type: DataTypes.STRING,
			allowNull:false,
			validate:{
				notEmpty: true
			}
		},

		postID:{
			type: DataTypes.INTEGER,
			allowNull:false
		}
	});
};