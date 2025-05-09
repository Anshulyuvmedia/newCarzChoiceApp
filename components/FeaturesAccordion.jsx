import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { MaterialIcons } from "@expo/vector-icons";

const FeaturesSheet = ({ features = [] }) => {
    const refRBSheet = useRef(null);
    const indexRef = useRef(0);
    const [selectedSection, setSelectedSection] = useState(null);
    const [index, setIndex] = useState(0);
    const [forceRenderKey, setForceRenderKey] = useState(0);

    if (!Array.isArray(features) || features.length === 0) {
        return <Text style={{ textAlign: "center", margin: 20 }}>No Features Available</Text>;
    }

    const handleOpenSheet = (section, i) => {
        indexRef.current = i;
        setSelectedSection(section);
        setTimeout(() => {
            refRBSheet.current.open();
        }, 50);
    };

    useEffect(() => {
        if (selectedSection) {
            setIndex(indexRef.current);
            setForceRenderKey((prev) => prev + 1);
        }
    }, [selectedSection]);

    const renderScene = () => {
        const section = features[index];
        return (
            <ScrollView key={forceRenderKey}>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.boldText]}>Feature</Text>
                    <Text style={[styles.tableCell, styles.boldText]}>Value</Text>
                </View>

                {Array.isArray(section?.details) && section.details.length > 0 ? (
                    section.details.map((feature, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{feature}</Text>
                            <View style={styles.iconContainer}>
                                <MaterialIcons
                                    name={feature.toLowerCase().includes("no") ? "close" : "check"}
                                    size={20}
                                    color={feature.toLowerCase().includes("no") ? "red" : "green"}
                                />
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ padding: 10 }}>No data available</Text>
                )}
            </ScrollView>
        );
    };

    return (
        <View>
            {features.map((section, i) => (
                <TouchableOpacity
                    key={i}
                    style={styles.sectionButton}
                    onPress={() => handleOpenSheet(section, i)}
                >
                    <Text style={styles.sectionTitle}>{section.name.substring(0, 32) || "Unknown"}</Text>
                    <Text style={{ color: "#007AFF", fontWeight: "bold" }}>View</Text>
                </TouchableOpacity>
            ))}

            <RBSheet
                ref={refRBSheet}
                height={500}
                openDuration={250}
                customStyles={{
                    container: styles.sheetContainer,
                }}
                onOpen={() => {
                    setIndex(indexRef.current);
                    setForceRenderKey((prev) => prev + 1);
                }}
            >
                {selectedSection && (
                    <View className="flex-1">
                        {/* ✅ Fixed: Display Selected Section Name */}
                        <Text style={styles.sheetTitle}>{selectedSection.name}</Text>
                        {renderScene()}
                    </View>
                )}
            </RBSheet>
        </View>
    );
};

export default FeaturesSheet;

const styles = StyleSheet.create({
    sectionButton: {
        backgroundColor: "white",
        padding: 12,
        margin: 7,
        borderRadius: 10,
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        textAlign: "start",
    },
    sheetContainer: {
        padding: 20,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        backgroundColor: "#fff",
        fontWeight: 'bold',
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    boldText: {
        fontWeight: "bold",
    },
    iconContainer: {
        width: 30,
        alignItems: "center",
    }
});
