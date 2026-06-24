import React, {useRef, useState} from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import Slider from "@react-native-community/slider";

import {examples, type Props as ExamplesTabProperties} from "./Examples";
import {propsExamples, type Props as PropsTabProperties} from "./Props";

const App = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerViewReference = useRef<React.ElementRef<typeof PagerView>>(null);
  const titles = ["Examples", "Props"];

  const setPage = (page: number) => {
    pagerViewReference.current?.setPage(page);
    setCurrentPage(page);
  };

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
    <SafeAreaView style={styles.homeScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            accessibilityIgnoresInvertColors
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
                accessibilityRole="button"
                accessibilityState={{selected: isActive}}
                key={title}
                onPress={() => setPage(index)}
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
      <PagerView
        ref={pagerViewReference}
        initialPage={0}
        style={styles.pagerViewContainer}
        onPageSelected={e => {
          setCurrentPage(e.nativeEvent.position);
        }}>
        {renderExampleTab(examples, true)}
        {renderExampleTab(propsExamples, true)}
      </PagerView>
    </SafeAreaView>
  );
};

export default App;

const colors = {
  accent: "#7C5CFF",
  border: "#D9DEEA",
  card: "#FFFFFF",
  ink: "#201A3D",
  muted: "#6A7284",
  page: "#F3F5FA",
  surface: "#2B2357",
  track: "#51486F",
};

const styles = StyleSheet.create({
  pagerViewContainer: {
    flex: 1,
    backgroundColor: colors.page,
  },
  homeScreenContainer: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  header: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ios: 8, default: 18}),
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
    resizeMode: "cover",
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
    shadowColor: "#101828",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 12,
    textAlign: "center",
  },
});
