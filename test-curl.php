<?php
$ch = curl_init("https://api.github.com/repos/doctrine/inflector/zipball/46351b6812b7b6d52b82c3efa5dfb786a198ec88");

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, "Composer-Test");

$data = curl_exec($ch);

echo "HTTP: " . curl_getinfo($ch, CURLINFO_HTTP_CODE) . PHP_EOL;
echo "Downloaded: " . strlen($data === false ? "" : $data) . PHP_EOL;
echo "Error: " . curl_error($ch) . PHP_EOL;

curl_close($ch);
