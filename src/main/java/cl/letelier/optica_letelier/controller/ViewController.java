package cl.letelier.optica_letelier.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {
    @GetMapping({"/","/pacientes","/archivo","/login"})
    public String index() {
        return "forward:/index.html";
    }
}
