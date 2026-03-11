package es.uniovi.recyclechain.backend.repository;

import es.uniovi.recyclechain.backend.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    
    List<Station> findByIsActiveTrue();
    
    Optional<Station> findByWalletAddress(String walletAddress);
    
    boolean existsByWalletAddress(String walletAddress);
}