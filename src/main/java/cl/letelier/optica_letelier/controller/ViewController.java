package cl.letelier.optica_letelier.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping({"/", "/login", "/pacientes", "/archivo"})
    public String forward() {
        return "forward:/index.html";
    }
}
