<?php
// $localBinary = 'yt-dlp'; 
$localBinary = 'youtube-dl'; 

//PERFORM UPDATE WHEN THE BUTTON IS CLICKED
$updateMessage = "";
 if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'update') {
    $updateOutput = shell_exec('sudo ' . $localBinary . ' --update-to nightly 2>&1');
    
    $updateMessage = "<div style='background: #e6f7ff; border: 1px solid #91d5ff; padding: 15px; margin-bottom: 20px; border-radius: 4px;color: #000000;'>";
    $updateMessage .= "<strong>Update-Process started:</strong><br><pre>" . htmlspecialchars($updateOutput) . "</pre>";
    $updateMessage .= "</div>";
}
//echo "<h2>yt-dlp Update Manager</h2>";

// Falls gerade ein Update durchgeführt wurde, Meldung anzeigen
echo $updateMessage;

// local version query
// 
$localVersionOutput = shell_exec($localBinary . ' --version');
$localVersion = trim($localVersionOutput);

if (empty($localVersion)) {
    echo "Error: Could not determine the local yt-dlp version (is the path correct?).<br>";
    $localVersion = "0.0.0"; // Fallback for query
} else {
    echo "local version: " . $localVersion . "<br>";
}


// 2. ONLINE VERSION query (GitHub-API)
$apiUrl = "https://api.github.com/repos/yt-dlp/yt-dlp-nightly-builds/releases/latest";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERAGENT => "PHP-Version-Checker",
    CURLOPT_TIMEOUT => 10
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && $response) {
    $data = json_decode($response, true);
    $onlineVersion = $data['tag_name'] ?? '';
    
    echo "Online Version: " . $onlineVersion . "<br><br>";
    
    // 3. COMPARE VERSIONS
    if ($localVersion === $onlineVersion) {
        echo "<strong>Your local version is up to date!</strong> 🎉";
    } else {
        echo "<strong>An update is available!</strong> 🚀<br>";
        echo "Would you like to update to version " . $onlineVersion . "?";
//        echo '<form method="POST" action="">';
//        echo '<input type="hidden" name="action" value="update">';
//        echo '<button type="submit" style="background-color: #1890ff; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 4px; cursor: pointer;">Update now!</button>';
//        echo '</form>';
        echo '<button id="update-submit" onclick="runUpdate(event)" style="background-color: #1890ff; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 4px; cursor: pointer;">Update now!</button>';
    }
} else {
    echo "Error retrieving the online version (HTTP code: $httpCode).";
}
