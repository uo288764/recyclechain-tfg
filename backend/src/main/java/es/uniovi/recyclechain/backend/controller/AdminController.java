package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.service.StationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private StationService stationService;

    @GetMapping("/stations")
    public ResponseEntity<List<Station>> getAllStations() {
        return ResponseEntity.ok(stationService.getStations());
    }

    @PostMapping("/stations")
    public ResponseEntity<Station> createStation(@RequestBody Station station) {
        stationService.addStation(station);
        return ResponseEntity.ok(station);
    }

    @PutMapping("/stations/{id}/activate")
    public ResponseEntity<?> activateStation(@PathVariable Long id) {
        stationService.activateStation(id);
        return ResponseEntity.ok("Station activated");
    }

    @PutMapping("/stations/{id}/deactivate")
    public ResponseEntity<?> deactivateStation(@PathVariable Long id) {
        stationService.deactivateStation(id);
        return ResponseEntity.ok("Station deactivated");
    }
}