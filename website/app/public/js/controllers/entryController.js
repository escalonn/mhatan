function deleteEntry(entry_id){
	//$('.modal-confirm').modal('hide');
	$.ajax({
		url: '/delentry',
		type: 'POST',
		data: { id: entry_id },
		success: function(data){
			var ec = new EntryController();
			ec.fetchData(function(udata){
				ec.printData(udata);
			});
		},
		error: function(jqXHR){
			console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
		}
	});
}
$('#btn-post').click(function(){
	$.ajax({
		url: '/addEntry',
		type: 'POST',
		data: {entry_text: $('#entry_text-tf').val()},
		success: function(data){
			var ec = new EntryController();
			ec.fetchData(function(udata){
				ec.printData(udata);
			});
		},
		error: function(jqXHR){
			alert('fail');
			console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
		}
	});
});

function EntryController()
{
	this.printData= function(data){
		var items=[];
		for (var i = 0; i < data.length; i++){
			items.push('<p id="' + data[i].entry_id + '">' + data[i].text_content + '<button type="button" class="btn" onclick="deleteEntry('+data[i].entry_id+')"><i class="icon-remove"></i></button></p><hr>'
		);
		console.log(items);
		$('#entries').html(items.join(''));
		}
	}

	this.fetchData= function(callback){
		$.ajax({
				url: '/entry',
				type: 'POST',
				data: { user_id: $('#userId').val()},
				dataType: "json",
				//contentType: "application/json",
				success: function(data){
					callback(data);
				},
				error: function(jqXHR){
					alert('error');
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
		});
	}
}