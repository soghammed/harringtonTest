
function hideAllItems(){
	$(`#footer`).css('display','none');
	$(`#carousel`).css('display','none');
}

function display(item){
	//hide any visible items
	hideAllItems();
	//show requested item
	$(`#${item}`).css('display','block');
}

$(document).ready(() => {
	/* menu navigation */
		$('.menu-list li a').click(e => {
			//on menu item click get #{item} name
			let item = e.target.href.split('#')[1];
			//show item
			display(item);
		})
	/*end menu navigation */

	/* footer code start */
		//validation code
		$('#footer_form').validate({ // initialize the plugin
		    rules: {
		        name: {
		            required: true,
		        },
		        email: {
		            required: true,
		        	email:true,
		        },
		        password:{
		        	required: true,
		            minlength: 8
		        },
		        validate_password:{
		        	required: true,
		        	minlength:8,
		        	equalTo:"#password"
		        }
		    }
		});

		//if validation successfull continue to submit
		$('#footer_form').submit(e => {
		 	e.preventDefault();
		 	//collect data
		 	let data = {
		 		name: $('#footer_form input[name=name]').val(),
		 		email: $('#footer_form input[name=email]').val(),
		 		password: $('#footer_form input[name=password]').val(),
		 		validate_password: $('#footer_form input[name=validate_password]').val()	 
		 	}
		 	if(data.name != '' && data.email != '' && data.password != '' && data.validate_password != '' ){
			 	//create form for submission
			 	const formData = new FormData;
			 	//append values to form
			 	for(const d in data){
			 		formData.append(d, data[d]);
			 	}
			 	//post form to backend
			 	fetch('http://localhost/harringtonTest/backend.php', {
			 		method: "POST",
			 		body: formData
				})
		 		.then( res => {
		 			//show feedback
		 			if(res.status === 200){
		 				alert('Data Saved');
		 			}
		 		});
		 	}
		});
	/* footer code end */


	/* carousel code start */
		fetch('http://localhost/harringtonTest/backend.php?carousel=1')
		.then( res => res.text())
		.then(res => {
			let data = JSON.parse(res);
			//dataIndex to keep track of index within parsed data.
			let dataIndex = 0;
			//list of given locations to create one carousel each
			let list = ['Harrington', 'Cornwall', 'Southwell', 'Mews', 'Kensington', 'Tourist', 'Apartments'];
			//iterate over locationList and create carousel html 
			list.map((location, index) => {
				let carousel = 
					`
					<div class="carousel-container">
						<h4>Carousel ${index+1}</h4>
						<div id="${location}" class="carousel slide" data-bs-ride="carousel">
							<div class="carousel-custom-data carousel-title" title="${data[dataIndex].title}">${data[dataIndex].title}</div>
							<div class="carousel-custom-data carousel-location">${location}</div>
						  <div class="carousel-indicators">
						    <button type="button" data-bs-target="#${location}" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
						    <button type="button" data-bs-target="#${location}" data-bs-slide-to="1" aria-label="Slide 1"></button>
						    <button type="button" data-bs-target="#${location}" data-bs-slide-to="2" aria-label="Slide 2"></button>
						    <button type="button" data-bs-target="#${location}" data-bs-slide-to="3" aria-label="Slide 3"></button>
						    <button type="button" data-bs-target="#${location}" data-bs-slide-to="4" aria-label="Slide 4"></button>
						  </div>
						  <div class="carousel-inner">
						    <div class="carousel-item active">
						      <img src="${data[dataIndex].url}" class="d-block w-100" alt="..."/>
						    </div>
						    <div class="carousel-item">
						      <img src="${data[dataIndex+1].url}" class="d-block w-100" alt="..."/>
						    </div>
						    <div class="carousel-item">
						      <img src="${data[dataIndex+2].url}" class="d-block w-100" alt="..."/>
						    </div>
						    <div class="carousel-item">
						      <img src="${data[dataIndex+3].url}" class="d-block w-100" alt="..."/>
						    </div>
						    <div class="carousel-item">
						      <img src="${data[dataIndex+4].url}" class="d-block w-100" alt="..."/>
						    </div>
						  </div>
						  <button class="carousel-control-prev" type="button" data-bs-target="#${location}"  data-bs-slide="prev">
						    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
						    <span class="visually-hidden">Previous</span>
						  </button>
						  <button class="carousel-control-next" type="button" data-bs-target="#${location}"  data-bs-slide="next">
						    <span class="carousel-control-next-icon" aria-hidden="true"></span>
						    <span class="visually-hidden">Next</span>
						  </button>
						</div>
					</div>`;
				//add carousel html to carousel section
				$('#carousel').append(carousel);
				//update dataIndex to use the next 5 images in the data list.
				dataIndex+=5;
			});
		});
	/* carousel code end */
})