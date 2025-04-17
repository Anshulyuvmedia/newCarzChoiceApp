import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import ModalSelector from 'react-native-modal-selector-searchable';

const CitySelector = ({ cityData = [], onSelectCity }) => {
    const [selectedCity, setSelectedCity] = useState('');
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    const selectorRef = useRef();

    const formattedCities = (cityData || []).map((city, index) => ({
        key: index,
        label: city.label || city.name || city,
        value: city.value || city.id || city,
    }));

    useEffect(() => {
        setFilteredData(formattedCities);
    }, [cityData]);

    const handleSearch = (text) => {
        setSearchText(text);
        const filtered = text.length
            ? formattedCities.filter((item) =>
                item.label.toLowerCase().includes(text.toLowerCase())
            )
            : formattedCities;
        setFilteredData(filtered);
    };

    const handleOpenModal = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            selectorRef.current.open(); // trigger modal open
        }, 300); // simulate delay
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleOpenModal} activeOpacity={0.7}>
                <View style={styles.input}>
                    {loading ? (
                        <ActivityIndicator color="gray" size="small" />
                    ) : (
                        <TextInput
                            style={styles.textInput}
                            editable={false}
                            pointerEvents="none"
                            placeholder="Search for your city"
                            value={selectedCity}
                        />
                    )}
                </View>
            </TouchableOpacity>

            <ModalSelector
                ref={selectorRef}
                data={filteredData}
                initValue="Choose a city"
                onChange={(option) => {
                    setSelectedCity(option.label);
                    onSelectCity(option.value);
                }}
                searchable={true}
                searchText={searchText}
                onSearch={handleSearch}
                cancelText="Cancel"
                animationType="slide"
                optionTextStyle={{ color: 'black', textTransform: 'capitalize' }}
                optionContainerStyle={{ backgroundColor: 'white' }}
                customSelector={<></>} // prevent default UI
            />
        </View>
    );
};

export default CitySelector;

const styles = StyleSheet.create({
    container: {
        marginVertical: 5,
    },
    input: {
        // backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        height: 35,
        borderRadius: 5,
        justifyContent: 'center',
    },
    textInput: {
        color: '#000',
        textTransform: 'capitalize',
        fontWeight: 600,
    },
});
