package es.uniovi.recyclechain.backend.service;

import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StationService {

    @Autowired
    private StationRepository stationRepository;

    public Station getStation(Long id) {
        return stationRepository.findById(id).orElse(null);
    }

    public List<Station> getStations() {
        return stationRepository.findAll();
    }

    public List<Station> getActiveStations() {
        return stationRepository.findByIsActiveTrue();
    }

    public Station getStationByWalletAddress(String walletAddress) {
        return stationRepository.findByWalletAddress(walletAddress).orElse(null);
    }

    public void addStation(Station station) {
        stationRepository.save(station);
    }

    public void activateStation(Long id) {
        Station station = getStation(id);
        if (station != null) {
            station.setIsActive(true);
            stationRepository.save(station);
        }
    }

    public void deactivateStation(Long id) {
        Station station = getStation(id);
        if (station != null) {
            station.setIsActive(false);
            stationRepository.save(station);
        }
    }

    public boolean existsByWalletAddress(String walletAddress) {
        return stationRepository.existsByWalletAddress(walletAddress);
    }
}