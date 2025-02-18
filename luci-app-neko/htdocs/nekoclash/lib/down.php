<?php
$stat = shell_exec("uci get neko.cfg.enabled");
if($stat==1) {
    // Get current rate
    $cmd = "ubus call luci getRealtimeStats '{\"device\":\"Meta\", \"mode\":\"interface\"}'";
    $response = shell_exec($cmd);
    $data = json_decode($response, true);
    
    if ($data && isset($data['result'])) {
        $stats = $data['result'];
        if (count($stats) >= 2) {
            $current = end($stats);
            $previous = prev($stats);
            $time_diff = $current[0] - $previous[0];
            $rx_rate = ($time_diff > 0) ? ($current[1] - $previous[1]) / $time_diff : 0;
            
            // Format rate
            if ($rx_rate < 1024) $data = number_format($rx_rate, 1)." B/s";
            elseif ($rx_rate < 1024000) $data = number_format(($rx_rate/1024),1)." KB/s";
            elseif ($rx_rate < 1024000000) $data = number_format(($rx_rate/1024000),1)." MB/s";
            else $data = number_format(($rx_rate/1024000000),2)." GB/s";
        }
    }
} else {
    $data = "0 B/s";
}
echo $data;
?>