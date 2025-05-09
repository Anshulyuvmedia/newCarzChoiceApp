import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { MaterialIcons } from "@expo/vector-icons";
const initialLayout = { width: Dimensions.get("window").width };

const SpecsSheet = ({ specifications = [] }) => {
    const refRBSheet = useRef(null);
    const indexRef = useRef(0); // 🔥 Persistent index
    const [selectedSpecs, setSelectedSpecs] = useState(null);
    const [index, setIndex] = useState(0);
    const [routes, setRoutes] = useState([]);
    const [forceRenderKey, setForceRenderKey] = useState(0); // 🔥 Force re-render key

    const groupedSpecs = Array.isArray(specifications)
        ? specifications.reduce((acc, spec) => {
            if (!acc[spec.name]) acc[spec.name] = [];
            acc[spec.name] = acc[spec.name].concat(spec.details || []);
            return acc;
        }, {})
        : {};

    const handleOpenSheet = (type) => {
        const selectedIndex = Object.keys(groupedSpecs).findIndex((key) => key === type);

        // console.log("(NOBRIDGE) LOG Selected Index:", selectedIndex);

        indexRef.current = selectedIndex; // 🔥 Store correct index
        setSelectedSpecs(type);
        setRoutes(Object.keys(groupedSpecs).map((key) => ({ key, title: key })));

        setTimeout(() => {
            refRBSheet.current.open();
        }, 50);
    };

    useEffect(() => {
        if (selectedSpecs) {
            // console.log("(NOBRIDGE) LOG Setting correct tab index:", indexRef.current);
            setIndex(indexRef.current);
            setForceRenderKey((prev) => prev + 1); // 🔥 Force full re-render
        }
    }, [selectedSpecs]);

    const renderScene = () => {
        const route = routes[index]; // 🔥 Always use current index

        // console.log("(NOBRIDGE) LOG Rendering scene for:", route?.key, "| Current Index:", index);

        return (
            <>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.boldText]}>Specifications</Text>
                    <Text style={[styles.tableCell, styles.boldText]}>Value</Text>
                </View>
                <ScrollView key={forceRenderKey}>
                    {groupedSpecs[route?.key]?.map((item, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.label}</Text>
                            <Text style={styles.tableCell}>
                                {item.value === "1" ? (
                                    <MaterialIcons name="check" size={20} color="green" />
                                ) : (
                                    item.value || "-"
                                )}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            </>
        );
    };

    return (
        <View>
            {Object.keys(groupedSpecs).map((type, idx) => (
                <TouchableOpacity
                    key={idx}
                    style={styles.sectionButton}
                    onPress={() => handleOpenSheet(type)}
                >
                    <Text style={styles.sectionTitle}>{type.substring(0, 30) || "Unknown"}</Text>
                    <Text style={{ color: "#007AFF", fontWeight: "bold" }}>View</Text>
                </TouchableOpacity>
            ))}

            <RBSheet
                ref={refRBSheet}
                height={450}
                openDuration={250}
                customStyles={{ container: styles.sheetContainer }}
                onOpen={() => {
                    // console.log("(NOBRIDGE) LOG Bottom sheet opened. Setting correct index:", indexRef.current);
                    setIndex(indexRef.current);
                    setForceRenderKey((prev) => prev + 1); // 🔥 Force full re-render
                }}
            >
                {selectedSpecs && (
                    <View className="flex-1">
                        {/* Selected Title Display */}
                        <Text style={styles.sheetTitle}>{selectedSpecs}</Text>
                        {renderScene()}
                    </View>
                )}
            </RBSheet>
        </View>
    );
};

export default SpecsSheet;

const styles = StyleSheet.create({
    sectionButton: {
        backgroundColor: "white",
        padding: 12,
        margin: 7,
        borderRadius: 10,
        borderBottomColor: "lightgray",
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
        textAlign: "start",
    },
    sheetContainer: {
        padding: 20,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        backgroundColor: "#fff",
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    boldText: {
        fontWeight: "bold",
    },
});