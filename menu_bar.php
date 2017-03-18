<?php
##############################
#Code: Paul Wright
#Date: 20110404
#Comment: Menu bar for petite adventure films
#copyright 2011

define('MAIN_MENU','menu_bar_',1);
define('GBUR_MENU','gbur_menu_bar_',1);

function MenuBar($currentPage,$menuBar)
{
    $translate;
    LoadArray('./php/lang/',$translate,$menuBar,$_COOKIE["lang"]);
    if($translate)
    {
        if(strcmp($menuBar,MAIN_MENU)===0)
        {
            echo '<div id="menu">';
        }
        echo '<ul>';
        foreach($translate as $key => $value)
        {
            if(strcmp($key,$currentPage) === 0)
            {
                switch($menuBar)
                {
                    case MAIN_MENU:
                        echo '<li class="current_page_item"><span>';
                        break;
                    default:
                        echo '<li class="current_page_item"><h3>';
                        break;
                }
                
            }
            else
            {
                switch($menuBar)
                {
                    case MAIN_MENU:
                        echo '<li>';
                        break;
                    default:
                        echo '<li><h3>';
                        break;
                }            
            }
            echo '<a href="' .$key . '.php">' . $translate[$key];
            if($key == $currentPage)
            {
                switch($menuBar)
                {
                    case MAIN_MENU:
                        echo '</a></span></li>';
                        break;
                    default:
                        echo '</a></h3></li>';
                        break;
                }                  
            }
            else
            {
                switch($menuBar)
                {
                    case MAIN_MENU:
                        echo '</a></li>';
                        break;
                    default:
                        echo '</a></h3></li>';
                        break;
                }                   
            }
        }
        echo '</ul>';
        if(strcmp($menuBar,MAIN_MENU)===0)
        {
            echo '</div>';
        }
    }
    else
    {
        echo '<div id="menu"></div>';
    }
}
?>