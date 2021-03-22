<?php

	global $conn;
	$servername = "localhost";
	$username = "root";
	$password = "";
	try {
	  $conn = new PDO("mysql:host=$servername;", $username, $password);
	  // set the PDO error mode to exception
	  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	  // echo "Connected successfully<br>";

	  //create db if doesnt exist
  	$conn->exec('CREATE DATABASE IF NOT EXISTS ctest');
  	
  	$conn->exec('USE ctest');

  	$newTableQuery = 'CREATE TABLE IF NOT EXISTS test (
  		id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  		name VARCHAR(255) NOT NULL,
  		email VARCHAR(255) NOT NULL,
  		password VARCHAR(255) NOT NULL
  	)';

  	$conn->exec($newTableQuery);
  	// echo "test Table created successfully <br>";
  	// echo 'ctest db selected';
	} catch(PDOException $e) {
	  echo "Error Occurred: " . $e->getMessage();
	}

?>