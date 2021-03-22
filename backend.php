<?php
	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\SMTP;
	use PHPMailer\PHPMailer\Exception;

	require 'vendor/autoload.php';
	include 'db.php';

	class FormData {

		public $isFormValid;
		public $db;

		function __construct($conn){
			$this->isFormValid = 0;
			$this->db = $conn;
			$this->mail = new PHPMailer(true);
		}

		function validateForm(){
			if(
				isset($_POST['name']) && $_POST['name'] != ''
				&& isset($_POST['email']) && $_POST['email'] != ''
				&& isset($_POST['password']) && $_POST['password'] != ''
				&& isset($_POST['validate_password']) && $_POST['validate_password'] != ''
			){
				$this->isFormValid = 1;
			}
		}

		function persistData(){
			$sql = "INSERT INTO test (name, email, password, validate_password) VALUES 
			('{$_POST['name']}', '{$_POST['email']}', '{$_POST['password']}', '{$_POST['validate_password']}')"; 
			try{
				$this->db->exec($sql);
				echo "Data saved!";
			} catch(PDOException $e) {
    			echo "Error Occurred: " . $e->getMessage();
			}
		}

		function sendEmail(){
			try {
			    //Server settings
			    $this->mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
			    $this->mail->isSMTP();                                            //Send using SMTP
			    $this->mail->Host       = 'smtp.mailtrap.io';                     //Set the SMTP server to send through
			    $this->mail->SMTPAuth   = true;                                   //Enable SMTP authentication
			    // enter your mailtrap username here
			    $this->mail->Username   = 'a9d4c5e2a83623';                     //SMTP username
			    //enter your mailtrap passsword
			    $this->mail->Password   = 'a1171f9f960604';                               //SMTP password
			    $this->mail->Port       = 2525;                                    //TCP port to connect to, use 465 for 
			    //Recipients
			    $this->mail->setFrom('info@test.co.uk', 'Mailer');
			    $this->mail->addAddress($_POST['email'], $_POST['name']);     //Add a recipient
			    //Content
			    $this->mail->isHTML(true);                                  //Set email format to HTML
			    $this->mail->Subject = 'Test';
			    $this->mail->Body    = "This is a basic thanks email";
			    $this->mail->send();
			    echo 'Message has been sent';
			} catch (Exception $e) {
			    echo "Message could not be sent. Mailer Error: {$this->mail->ErrorInfo}";
			}
		}
	}



	//carousel

	if(isset($_POST['name']) && $_POST['name'] != ''){
		$clientData = new FormData($conn);
		$clientData->validateForm();
		if($clientData->isFormValid){
			$clientData->persistData();
			$clientData->sendEmail();
		}else{
			return 'Please check form values';
		}
	}else if(isset($_GET['carousel'])){	
		$photos = file_get_contents('https://jsonplaceholder.typicode.com/photos');
		$photos = json_decode($photos, true);
		echo json_encode($photos);
	}



?>