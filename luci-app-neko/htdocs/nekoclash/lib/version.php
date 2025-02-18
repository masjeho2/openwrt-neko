<?php
/**
 * MIT License
 *
 * Copyright (c) 2024 Nosignal <https://github.com/nosignals>
 * 
 * Contributors:
 * - bobbyunknown <https://github.com/bobbyunknown>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


$neko_version = exec("opkg list-installed | grep luci-app-neko | cut -d ' - ' -f3");
$neko_latest = exec("curl -m 5 -f -s https://raw.githubusercontent.com/nosignals/openwrt-neko/main/luci-app-neko/Makefile | grep PKG_VERSION: | cut -d= -f2");

$response = [
    'current' => trim($neko_version),
    'latest' => trim($neko_latest),
    'needsUpdate' => ($neko_version != $neko_latest)
];

header('Content-Type: application/json');
echo json_encode($response);
?>