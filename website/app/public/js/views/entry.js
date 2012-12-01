$(document).ready(function(){
	var ec = new EntryController();
	ec.fetchData(function(data){
		ec.printData(data);
	});
})