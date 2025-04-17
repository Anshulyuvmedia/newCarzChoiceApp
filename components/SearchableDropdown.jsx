import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Modal, Portal, List, Button, TextInput, FlatList, Provider as PaperProvider } from "react-native-paper";

const SearchableDropdown = ({ data, label, selectedItem, setSelectedItem }) => {
    const [searchText, setSearchText] = useState("");
    const [filteredData, setFilteredData] = useState(data);
    const [visible, setVisible] = useState(false);

    const handleSearch = (text) => {
        setSearchText(text);
        if (!text) {
            setFilteredData(data);
        } else {
            const filtered = data.filter((item) =>
                item.label.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredData(filtered);
        }
    };

    return (
        <PaperProvider>
            <View>
                {/* Input Field */}
                <TextInput
                    label={label}
                    value={searchText}
                    onChangeText={handleSearch}
                    onFocus={() => setVisible(true)}
                    placeholder="Search..."
                    mode="outlined"
                />

                {/* Off-Canvas Bottom Modal */}
                <Portal>
                    <Modal
                        visible={visible}
                        onDismiss={() => setVisible(false)}
                        contentContainerStyle={{
                            position: "absolute",
                            bottom: 0,
                            width: "100%",
                            backgroundColor: "white",
                            padding: 20,
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            maxHeight: "70%", // ✅ Ensures it's scrollable
                        }}
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{ flex: 1 }}
                        >
                            <FlatList
                                data={filteredData}
                                keyExtractor={(item) => item.value.toString()}
                                keyboardShouldPersistTaps="handled" // ✅ Allows tapping while keyboard is open
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                renderItem={({ item }) => (
                                    <List.Item
                                        title={item.label}
                                        onPress={() => {
                                            setSelectedItem(item);
                                            setSearchText(item.label);
                                            setVisible(false);
                                        }}
                                    />
                                )}
                            />
                            <Button mode="contained" onPress={() => setVisible(false)}>Close</Button>
                        </KeyboardAvoidingView>
                    </Modal>
                </Portal>
            </View>
        </PaperProvider>
    );
};

export default SearchableDropdown;
