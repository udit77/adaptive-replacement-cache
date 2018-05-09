<?php
require '../vendor/autoload.php';

class DataRetriver{

	public $db = null;

	function getDB()
    {
        $json = json_decode(file_get_contents("../config.json"), true);
        $username = $json['db_user'];
        $password = $json['db_pwd'];
        $host = $json['host'];
        $conn = mysqli_connect($host, $username, $password);
        return $conn;
    }

	function executeQuery($query)
	{
		if($this->db == null){
			$this->db = DataRetriver::getDB();
		}
		$result = mysqli_query($this->db, $query);
		return $result;
	}

	function getValue($tableName, $key)
	{
		$sql = "SELECT * FROM testDB.$tableName WHERE word = '$key'";
		$result = DataRetriver::executeQuery($sql);
		return $result;
	}

	function getAllKeyValues($tableName)
	{
		$sql = "SELECT * FROM testDB.$tableName";
		$result = DataRetriver::executeQuery($sql);
		return $result;
	}

	function storeEvictedKeys($tableName, $key)
	{
	
		$sql = "INSERT INTO testDB.".$tableName." (word) VALUES ('$key')";
		$result = DataRetriver::executeQuery($sql);
		return $result;
	}

	function createTestDB(){
		$result = false;

		$sql = "DROP DATABASE testDB";
		$result = DataRetriver::executeQuery($sql);
		
		$sql = "CREATE DATABASE testDB";
		$result = DataRetriver::executeQuery($sql);

		if($result){
			$sql = "CREATE TABLE testDB.keyvalue (
				word varchar(20),
				meaning varchar(20)
			)";
			$result = DataRetriver::executeQuery($sql);
		}

		if($result){
			$sql = "CREATE TABLE testDB.evictedkeys (
				word varchar(20)
			)";
			$result = DataRetriver::executeQuery($sql);
		}

		if($result) {
			$sql = "INSERT INTO testDB.keyvalue (word, meaning) VALUES 
			('Accolade', 'Praise'),
			('Abase', 'Degrade'),
			('Humiliate', 'Make humble'),
			('Abash', 'Embarrass'),
			('Abate', 'Subside'),
			('Abbreviate', 'Shorten'),
			('Abjure', 'Renounce'),
			('Ablution', 'Washing'),
			('Abnegation', 'Renuniciation'),
			('Abode', 'Dwelling'),
			('Abominable', 'Detestable'),
			('Pretty', 'Beautiful'),
			('Pensive', 'Deep'),
			('Perpetual','Everlasting'),
			('Abominate', 'Loathe')";
			$result = DataRetriver::executeQuery($sql);

		}

		return $result;
	}
}


$app = new Slim\App([
    'settings' => [
        'displayErrorDetails' => true
    ]
]);

$app->get('/', function() {
	echo "Adaptive Replacement Cache Demo Project";
});

$app->get('/key', function($req, $res) {
	$params = $req->getQueryParams();
	$key = $params['word'];

	$result = ((new DataRetriver)->getValue('keyvalue', $key));
	$row = $result->fetch_array();
	$result = $row["meaning"];
	if(is_null($result)){
		echo json_encode(['status'=>'NOT_FOUND']);
	}else{
		echo json_encode(['status'=>'FOUND','meaning'=>$result]);
		//echo $result;
	}
});

$app->get('/allKeyValues', function($req,$res) {
	$result = ((new DataRetriver)->getAllKeyValues('keyvalue'));
	$rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
	$returnJson = array();
	foreach($rows as $row){
		$returnJson[$row['word']] = $row['meaning'];
	}
	echo json_encode($returnJson);
});

$app->post('/evictedKey', function($req, $res) {
	$request = $req->getParsedBody()['word'];
	$result = ((new DataRetriver)->storeEvictedKeys('evictedkeys', $request));
	echo $result;
});

$app->get('/allEvictedkeys', function($req, $res) {
	$result = ((new DataRetriver)->getAllKeyValues('evictedkeys'));
	$rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
	$returnJson = array();
	foreach($rows as $row){
		$returnJson[] = $row['word'];
	}
	echo json_encode($returnJson);
});

$app->post('/initializeDb', function($req, $res){
	$request = $req->getParsedBody();
	$result = ((new DataRetriver())->createTestDB());

	if($result){
		echo json_encode(['status'=>'SUCCESS']);
	} else {
		echo json_encode(['status'=>'FAILURE']);
	}
});

$app->run();

?>