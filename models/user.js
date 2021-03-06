var bcrypt = require ('bcryptjs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var secretKey = process.env.SECRET_KEY;

module.exports = function (sequelize, DataTypes) {
	var user = sequelize.define('user', {
		userName: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, 
			validate: {
				isEmail: true
			}
		},
		admin:{
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		//salt: random character at the end of string before hashing
		salt: {
			type: DataTypes.STRING
		},
		password_hash:{
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL, //VIRTUAL data is not stored in db
			allowNull: false,
			validate: {
				len: [7,100]
			},
			set: function (value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue("password_hash", hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function (user, options){
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function (body){
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string'){
						return reject();
					}

					user.findOne({
						where: {
							email: body.email
						}
					}).then(function (user){
						//if no users found or if password is incorrect
						if(!user || !bcrypt.compareSync(body.password, user.get('password_hash'))){
							return reject();
						}
						resolve(user);
					}, function (e){
						reject();
					});
				});
			},
			findByToken: function (token){
				return new Promise(function (resolve, reject){
					try {
						var decodedJWT = jwt.verify(token, secretKey); //take the same key from generateToken
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, secretKey);
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						user.findById(tokenData.id).then(function (user){
							if (user) {
								resolve(user);
							}
						}, function (e){
							reject();
						});
					}catch (e){
						reject();
					}
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function () {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			},
			generateToken: function (type){
				if (!_.isString(type)){
					return undefined;
				}

				try{
					var stringData = JSON.stringify({id: this.get('id'), type: type});
					var encryptedData = cryptojs.AES.encrypt(stringData, secretKey).toString();
					var token = jwt.sign({
						token: encryptedData
					}, secretKey);

					return token;
				} catch (e){
					return undefined;
				}
			}
		}
	}); 
	return user;
}