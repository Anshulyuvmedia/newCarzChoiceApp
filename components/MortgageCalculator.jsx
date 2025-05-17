import React, { useState, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
    Platform, TouchableOpacity, Dimensions
} from "react-native";
import Slider from "@react-native-community/slider";
import { useDebounce } from 'use-debounce';

const MortgageCalculator = ({ closeSheet, totalprice }) => {
    // Initialize with safe defaults
    const initialPrice = totalprice > 0 ? Math.round(totalprice) : 100000;
    const [totalPrice] = useState(initialPrice);
    const [loanPeriod, setLoanPeriod] = useState(60);
    const [downPayment, setDownPayment] = useState(Math.min(100000, initialPrice));
    const [interestRate, setInterestRate] = useState(8.5);

    // Debounce slider values to prevent glitches
    const [debouncedLoanPeriod] = useDebounce(loanPeriod, 100);
    const [debouncedDownPayment] = useDebounce(downPayment, 100);
    const [debouncedInterestRate] = useDebounce(interestRate, 100);

    // Calculations with input validation
    const calculateMortgage = useCallback(() => {
        const loanAmount = Math.max(totalPrice - debouncedDownPayment, 0);
        const monthlyRate = debouncedInterestRate > 0 ? (debouncedInterestRate / 100) / 12 : 0;
        const numPayments = Math.max(debouncedLoanPeriod, 1);

        let monthlyPayment = 0;
        if (loanAmount > 0 && numPayments > 0) {
            if (debouncedInterestRate === 0) {
                monthlyPayment = loanAmount / numPayments;
            } else {
                monthlyPayment = (loanAmount * monthlyRate) /
                    (1 - Math.pow(1 + monthlyRate, -numPayments));
            }
        }

        const totalPayment = monthlyPayment * numPayments;
        const totalInterest = totalPayment - loanAmount;

        return {
            monthlyPayment: isNaN(monthlyPayment) ? 0 : Math.round(monthlyPayment),
            totalPayment: isNaN(totalPayment) ? 0 : Math.round(totalPayment),
            totalInterest: isNaN(totalInterest) ? 0 : Math.round(totalInterest),
            loanAmount: Math.round(loanAmount)
        };
    }, [totalPrice, debouncedDownPayment, debouncedInterestRate, debouncedLoanPeriod]);

    const { monthlyPayment, totalPayment, totalInterest, loanAmount } = calculateMortgage();

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>🚗 Car Current Price:</Text>
                        <Text style={styles.infoValue}>₹ {totalPrice.toLocaleString('en-IN')}</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>📆 Loan Duration ({loanPeriod} Months)</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={12}
                            maximumValue={84}
                            step={1}
                            value={loanPeriod}
                            onValueChange={setLoanPeriod}
                            minimumTrackTintColor="#3B82F6"
                            maximumTrackTintColor="#E5E7EB"
                            thumbTintColor="#3B82F6"
                        />
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>12M</Text>
                            <Text style={styles.sliderLabel}>84M</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>💵 Down Payment (₹{debouncedDownPayment.toLocaleString('en-IN')})</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={10000}
                            maximumValue={totalPrice}
                            step={5000}
                            value={downPayment}
                            onValueChange={setDownPayment}
                            minimumTrackTintColor="#3B82F6"
                            maximumTrackTintColor="#E5E7EB"
                            thumbTintColor="#3B82F6"
                        />
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>₹10K</Text>
                            <Text style={styles.sliderLabel}>₹{totalPrice.toLocaleString('en-IN')}</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>📈 Interest Rate ({interestRate.toFixed(1)}%)</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={1}
                            maximumValue={15}
                            step={0.1}
                            value={interestRate}
                            onValueChange={setInterestRate}
                            minimumTrackTintColor="#3B82F6"
                            maximumTrackTintColor="#E5E7EB"
                            thumbTintColor="#3B82F6"
                        />
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>1%</Text>
                            <Text style={styles.sliderLabel}>15%</Text>
                        </View>
                    </View>

                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>📊 Loan Summary</Text>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Monthly EMI</Text>
                            <Text style={styles.resultValue}>₹{monthlyPayment.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Loan Amount</Text>
                            <Text style={styles.resultValue}>₹{loanAmount.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Total Interest</Text>
                            <Text style={styles.resultValue}>₹{totalInterest.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Total Payment</Text>
                            <Text style={styles.resultValue}>₹{totalPayment.toLocaleString('en-IN')}</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingBottom: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
    },
    closeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
    },
    closeButtonText: {
        color: '#DC2626',
        fontSize: 16,
        fontWeight: '600',
    },
    keyboardView: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    infoCard: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoLabel: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    slider: {
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    sliderLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    resultCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    resultLabel: {
        fontSize: 16,
        color: '#6B7280',
    },
    resultValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
});

export default MortgageCalculator;