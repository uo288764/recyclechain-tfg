package es.uniovi.recyclechain.backend.config;

import es.uniovi.recyclechain.backend.model.Role;
import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.model.User;
import es.uniovi.recyclechain.backend.service.StationService;
import es.uniovi.recyclechain.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private StationService stationService;

    @Override
    public void run(String... args) throws Exception {
        // Create admin if no admin exists
        if (!userService.existsByEmail("admin@recyclechain.com")) {
            User admin = new User();
            admin.setEmail("admin@recyclechain.com");
            admin.setPasswordHash("admin123");
            admin.setName("Administrator");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setIsActive(true);
            userService.addUser(admin);
            System.out.println("Admin user created: admin@recyclechain.com / admin123");
        }

        // Create test stations if no station exists
        if (stationService.getStations().isEmpty()) {
            // Estación 1: Campus de Llamaquique (Oviedo)
            Station station1 = new Station();
            station1.setName("Punto de Reciclaje Campus Llamaquique");
            station1.setAddress("Campus de Llamaquique, 33005 Oviedo, Asturias");
            station1.setLatitude(43.3548);
            station1.setLongitude(-5.8585);
            station1.setWalletAddress("0xStation1LlamaquiqueOviedo");
            station1.setIsActive(true);
            stationService.addStation(station1);

            // Station 2: Centro de Oviedo
            Station station2 = new Station();
            station2.setName("Punto de Reciclaje Plaza del Ayuntamiento");
            station2.setAddress("Plaza del Ayuntamiento, 33009 Oviedo, Asturias");
            station2.setLatitude(43.3619);
            station2.setLongitude(-5.8449);
            station2.setWalletAddress("0xStation2PlazaAyuntamiento");
            station2.setIsActive(true);
            stationService.addStation(station2);

            // Station 3: Parque San Francisco
            Station station3 = new Station();
            station3.setName("Punto de Reciclaje Parque San Francisco");
            station3.setAddress("Parque de San Francisco, 33003 Oviedo, Asturias");
            station3.setLatitude(43.3631);
            station3.setLongitude(-5.8476);
            station3.setWalletAddress("0xStation3ParqueSanFrancisco");
            station3.setIsActive(true);
            stationService.addStation(station3);

            // Station 4: Campus de Gijón
            Station station4 = new Station();
            station4.setName("Punto de Reciclaje Campus Gijón");
            station4.setAddress("Campus de Gijón, 33203 Gijón, Asturias");
            station4.setLatitude(43.5322);
            station4.setLongitude(-5.6611);
            station4.setWalletAddress("0xStation4CampusGijon");
            station4.setIsActive(true);
            stationService.addStation(station4);

            // Station 5: Campus de Mieres
            Station station5 = new Station();
            station5.setName("Punto de Reciclaje Campus Mieres");
            station5.setAddress("Campus de Mieres, 33600 Mieres, Asturias");
            station5.setLatitude(43.2486);
            station5.setLongitude(-5.7716);
            station5.setWalletAddress("0xStation5CampusMieres");
            station5.setIsActive(true);
            stationService.addStation(station5);

            System.out.println("5 recycling stations created in Asturias");
        }

        System.out.println("Data initialization completed");
    }
}
