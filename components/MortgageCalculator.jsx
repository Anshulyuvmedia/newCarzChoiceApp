import React, { useState } from "react";
import {
    View, Text, TextInput, Dimensions, StyleSheet, ScrollView, KeyboardAvoidingView,
    Platform, TouchableOpacity
} from "react-native";
import Slider from "@react-native-community/slider";
// import { PieChart } from "react-native-chart-kit";

const MortgageCalculator = ({ closeSheet, totalprice }) => {
    const [totalPrice, setTotalPrice] = useState(totalprice > 0 ? totalprice : 100000);
    const [loanPeriod, setLoanPeriod] = useState(60); // in months
    const [downPayment, setDownPayment] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);

    const loanAmount = Math.max(totalPrice - downPayment, 0);
    const monthlyRate = interestRate > 0 ? (interestRate / 100) / 12 : 0;
    const numPayments = Math.max(loanPeriod, 1); // already in months
    const monthlyPayment = loanAmount > 0 && numPayments > 0
        ? (interestRate === 0
            ? loanAmount / numPayments
            : (loanAmount * monthlyRate) /
            (1 - Math.pow(1 + monthlyRate, -numPayments)))
        : 0;
    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;

    return (
        <View style={{ flex: 1 }}>
            <View className="flex flex-row justify-between items-center mb-3">
                <Text style={styles.title}>EMI Calculator</Text>
                <TouchableOpacity onPress={closeSheet}>
                    <Text className="text-lg font-rubik-bold text-red-500">
                        Close
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View className="mt-3 text-center">
                        <Text className=" text-center" style={styles.label}>🚗 Car Price: ₹ {totalPrice.toLocaleString()}</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>📆 Duration of Loan (Months): {loanPeriod}</Text>
                        <Slider
                            minimumValue={12}
                            maximumValue={84}
                            step={1}
                            value={loanPeriod}
                            onValueChange={setLoanPeriod}
                            minimumTrackTintColor="#007bff"
                            maximumTrackTintColor="#ccc"
                        />
                        <View style={styles.sliderLabels}>
                            <Text>12 Months</Text>
                            <Text>84 Months</Text>
                        </View>
                    </View>


                    <View style={styles.card}>
                        <Text style={styles.label}>💵 Down Payment (₹): {downPayment.toLocaleString()}</Text>
                        <Slider
                            minimumValue={10000}
                            maximumValue={totalPrice}
                            step={5000}
                            value={downPayment}
                            onValueChange={setDownPayment}
                            minimumTrackTintColor="#007bff"
                            maximumTrackTintColor="#ccc"
                        />
                        <View style={styles.sliderLabels}>
                            <Text>₹10,000</Text>
                            <Text>₹{totalPrice.toLocaleString()}</Text>
                        </View>
                    </View>


                    <View style={styles.card}>
                        <Text style={styles.label}>📈 Interest Rate (%): {interestRate.toFixed(2)}</Text>
                        <Slider
                            minimumValue={1}
                            maximumValue={15}
                            step={0.1}
                            value={interestRate}
                            onValueChange={setInterestRate}
                            minimumTrackTintColor="#007bff"
                            maximumTrackTintColor="#ccc"
                        />
                        <View style={styles.sliderLabels}>
                            <Text>1%</Text>
                            <Text>15%</Text>
                        </View>
                    </View>


                    <View style={[styles.card, { backgroundColor: "#f9fafb" }]}>
                        <Text style={styles.resultTitle}>📊 Results</Text>
                        <Text style={styles.resultText}>📅 Monthly Payment: ₹ {Math.round(monthlyPayment).toLocaleString()}</Text>
                        <Text style={styles.resultText}>💰 Total Payment: ₹ {Math.round(totalPayment).toLocaleString()}</Text>
                    </View>

                    {/* Optional Pie Chart */}
                    {/* <PieChart
                        data={[
                            { name: "Principal", amount: loanAmount, color: "#4CAF50", legendFontColor: "#000", legendFontSize: 14 },
                            { name: "Interest", amount: totalInterest, color: "#FF5722", legendFontColor: "#000", legendFontSize: 14 }
                        ]}
                        width={Dimensions.get("window").width - 40}
                        height={220}
                        chartConfig={{ color: () => `rgba(0,0,0,0.8)` }}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="10"
                        style={{ marginTop: 20, alignSelf: "center" }}
                    /> */}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default MortgageCalculator;

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: "#f5f7fa",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        paddingVertical: 15,
        backgroundColor: "#fff",
        marginStart: 15,
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 6,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
    },
    input: {
        height: 48,
        backgroundColor: "#eef2f7",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginTop: 10,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
    },
    resultText: {
        fontSize: 20,
        marginBottom: 5,
        fontWeight: "600",
        fontFamily: 'Rubik-Bold',
    },
    sliderLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
        paddingHorizontal: 5,
    },

});
