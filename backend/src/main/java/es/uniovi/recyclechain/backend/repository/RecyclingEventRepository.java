package es.uniovi.recyclechain.backend.repository;

import es.uniovi.recyclechain.backend.model.RecyclingEvent;
import es.uniovi.recyclechain.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecyclingEventRepository extends JpaRepository<RecyclingEvent, Long> {
    
    List<RecyclingEvent> findByUserOrderByCreatedAtDesc(User user);
    
    List<RecyclingEvent> findByUser_IdOrderByCreatedAtDesc(Long userId);
}