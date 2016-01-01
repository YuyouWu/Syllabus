angular.module('subjectService',[])
.factory('Subject', function ($http){

	var subjects = {};

	//get all subjects
	subjects.all = function (){
		return $http.get('/subjects');
	}

	//search subject by name
	subjects.search = function (searchKey){
		return $http.get('/subjects?q=' + searchKey);
	}

	//Request new subject
	subjects.create = function (subjectNameReq){
		return $http.post('/subjects', subjectNameReq);
	}

	return subjects;
});