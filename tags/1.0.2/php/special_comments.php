<?php
echo lp_comment::$comments_template_tag['start'];
include(lp_comment::$comments_template_path);
echo lp_comment::$comments_template_tag['end'];
?>
