import { Slot } from "expo-router";
import { LocationProvider } from '@/components/LocationContext';
const AppLayout = () => {
    return (
        <LocationProvider>
            <Slot />
        </LocationProvider>
    );
};

export default AppLayout;
