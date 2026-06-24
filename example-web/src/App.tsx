import React, {useState} from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";

import {examples, type Props as ExamplesTabProperties} from "./Examples";
import {propsExamples, type Props as PropsTabProperties} from "./Props";

const App = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const titles = ["Examples", "Props"];

  const renderExampleTab = (
    sliders: PropsTabProperties[] | ExamplesTabProperties[],
    filtered?: boolean,
  ) => {
    const tabSliders = filtered
      ? (sliders as ExamplesTabProperties[]).filter(
          e => !e.platform || e.platform === Platform.OS,
        )
      : sliders;

    return (
      <View style={styles.page}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}>
          {tabSliders.map((e, i) => (
            <View key={`slider${i}`} style={styles.sliderCard}>
              <Text style={styles.cardTitle}>{e.title}</Text>
              {e.render()}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.homeScreenContainer}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={require("../assets/slider-example-icon.png")}
            style={styles.brandMark}
          />
          <View style={styles.brandCopy}>
            <Text style={styles.eyebrow}>Callstack</Text>
            <Text style={styles.appTitle}>React Native Slider</Text>
          </View>
        </View>
        <View style={styles.tabBar}>
          {titles.map((title, index) => {
            const isActive = index === currentPage;
            return (
              <Pressable
                accessibilityState={{selected: isActive}}
                key={title}
                onPress={() => setCurrentPage(index)}
                role="button"
                style={[styles.tab, isActive && styles.activeTab]}>
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {title}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Slider
          step={1}
          maximumValue={1}
          minimumValue={0}
          style={styles.pageIndicator}
          value={currentPage}
          thumbTintColor={colors.accent}
          disabled
          maximumTrackTintColor={colors.track}
          minimumTrackTintColor={colors.accent}
        />
        <Text testID="testTextId" style={styles.sectionTitle}>
          {titles[currentPage]}
        </Text>
      </View>
      {currentPage === 0
        ? renderExampleTab(examples, true)
        : renderExampleTab(propsExamples, true)}
    </View>
  );
};

export default App;

const colors = {
  accent: "#7C5CFF",
  border: "#D9DEEA",
  card: "#FFFFFF",
  ink: "#201A3D",
  page: "#F3F5FA",
  track: "#51486F",
};

const styles = StyleSheet.create({
  homeScreenContainer: {
    flex: 1,
    minHeight: "100vh" as never,
    backgroundColor: colors.ink,
  },
  header: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    marginBottom: 22,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  brandCopy: {
    flex: 1,
  },
  eyebrow: {
    color: "#B9B2DF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  appTitle: {
    color: colors.card,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#332A61",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: colors.card,
  },
  tabText: {
    color: "#D9D4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  activeTabText: {
    color: colors.ink,
  },
  pageIndicator: {
    height: 32,
    marginHorizontal: -4,
    marginTop: 12,
  },
  sectionTitle: {
    color: colors.card,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  page: {
    flex: 1,
    backgroundColor: colors.page,
  },
  scrollView: {
    backgroundColor: colors.page,
  },
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  sliderCard: {
    alignSelf: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
    maxWidth: 460,
    paddingHorizontal: 18,
    paddingVertical: 18,
    width: "100%",
    boxShadow: "0 8px 18px rgba(16, 24, 40, 0.08)" as never,
  },
  cardTitle: {
    alignSelf: "stretch",
    color: colors.ink,
    flexShrink: 1,
    flexWrap: "wrap",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 12,
    maxWidth: "100%",
    textAlign: "center",
    whiteSpace: "normal" as never,
  },
});
