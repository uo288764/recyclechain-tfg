package es.uniovi.recyclechain.backend.repository;

import es.uniovi.recyclechain.backend.model.RecyclingEvent;
import es.uniovi.recyclechain.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecyclingEventRepository extends JpaRepository<RecyclingEvent, Long> {

    List<RecyclingEvent> findByUserOrderByCreatedAtDesc(User user);

    List<RecyclingEvent> findByUser_IdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(e) FROM RecyclingEvent e")
    Long countAllEvents();

    @Query("SELECT COALESCE(SUM(e.weight), 0.0) FROM RecyclingEvent e")
    Double sumAllWeight();

    @Query("SELECT COALESCE(SUM(e.tokensEarned), 0.0) FROM RecyclingEvent e")
    Double sumAllTokens();

    @Query("SELECT COUNT(DISTINCT e.user) FROM RecyclingEvent e")
    Long countActiveUsers();
}