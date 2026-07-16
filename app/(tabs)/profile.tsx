import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, LogOut, Moon, Sun, UserPlus, Users } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useApp } from "../../components/mockup/AppContext";
import { findUser, pastTrips } from "../../components/mockup/data";
import { M, RADIUS, useMockTheme } from "../../components/mockup/theme";
import { Btn, MockScreen, RatingBadge, ShellCard, textInputStyle } from "../../components/mockup/ui";
import { UserService } from "../../store/all";

export default function ProfileScreen() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [realUser, setRealUser] = useState<{ full_name: string; email: string } | null>(null);

  React.useEffect(() => {
    UserService.me()
      .then((u) => setRealUser({ full_name: u.full_name, email: u.email }))
      .catch(() => setRealUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await UserService.logout();
      router.replace("/login");
    } catch (error: any) {
      alert("Logout failed: " + (error?.message ?? String(error)));
    } finally {
      setLoggingOut(false);
    }
  };

  const {
    currentUser,
    users,
    connections,
    profileView,
    setProfileView,
    selectedProfileUserId,
    setSelectedProfileUserId,
    newFriendEmail,
    setNewFriendEmail,
    addFriendFromProfile,
    driverFriends,
    driverFriendFolders,
    setDriverSyncOpen,
    openDriverCreateFolder,
  } = useApp();
  const { scheme, setScheme } = useMockTheme();

  if (profileView === "connections") {
    return (
      <MockScreen>
        <TouchableOpacity
          onPress={() => {
            setProfileView("overview");
            setSelectedProfileUserId(null);
          }}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <ChevronLeft color={M.stone500} size={18} />
          <Text style={{ color: M.stone500, fontWeight: "700", fontSize: 13 }}>Profile</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>Connections</Text>

        <View style={{ gap: 12 }}>
          {connections.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => {
                setSelectedProfileUserId(c.id);
                setProfileView("connection_profile");
              }}
            >
              <ShellCard>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
                  <Image source={{ uri: c.avatar }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950 }}>{c.name}</Text>
                    <Text style={{ color: M.stone500, fontSize: 13 }}>{c.email}</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                      <RatingBadge
                        label="Driver"
                        rating={c.driverRating}
                        reviewCount={c.driverReviewCount}
                        ridesCompleted={c.driverRidesCompleted}
                        compact
                      />
                      <RatingBadge
                        label="Rider"
                        rating={c.riderRating}
                        reviewCount={c.riderReviewCount}
                        ridesCompleted={c.riderRidesCompleted}
                        compact
                      />
                    </View>
                  </View>
                  <ChevronRight color={M.amber500} size={22} />
                </View>
              </ShellCard>
            </TouchableOpacity>
          ))}
        </View>
      </MockScreen>
    );
  }

  if (profileView === "connection_profile") {
    const user = selectedProfileUserId ? findUser(users, selectedProfileUserId) : null;
    return (
      <MockScreen>
        <TouchableOpacity
          onPress={() => {
            setProfileView("connections");
            setSelectedProfileUserId(null);
          }}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <ChevronLeft color={M.stone500} size={18} />
          <Text style={{ color: M.stone500, fontWeight: "700", fontSize: 13 }}>Connections</Text>
        </TouchableOpacity>

        {user ? (
          <>
            <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>Profile</Text>

            <ShellCard>
              <View style={{ padding: 20, gap: 16, alignItems: "center" }}>
                <Image
                  source={{ uri: user.avatar }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 4,
                    borderColor: M.amber100,
                  }}
                />
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: M.stone950 }}>{user.name}</Text>
                  <Text style={{ color: M.stone500, fontSize: 13 }}>{user.email}</Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  <RatingBadge
                    label="Driver"
                    rating={user.driverRating}
                    reviewCount={user.driverReviewCount}
                    ridesCompleted={user.driverRidesCompleted}
                  />
                  <RatingBadge
                    label="Rider"
                    rating={user.riderRating}
                    reviewCount={user.riderReviewCount}
                    ridesCompleted={user.riderRidesCompleted}
                  />
                </View>

                <View
                  style={{
                    width: "100%",
                    backgroundColor: M.amber50,
                    padding: 12,
                    borderRadius: RADIUS.md,
                    gap: 8,
                  }}
                >
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>
                    Recent Driver Reviews
                  </Text>
                  {(user.driverReviews || []).length === 0 ? (
                    <Text style={{ color: M.stone500, fontSize: 11 }}>No driver reviews yet.</Text>
                  ) : (
                    (user.driverReviews || []).slice(0, 3).map((r) => (
                      <Text key={r.id} style={{ color: M.stone600, fontSize: 11, lineHeight: 16 }}>
                        <Text style={{ color: M.amber600, fontWeight: "900" }}>{r.rating}.0 ★</Text>{" "}
                        {r.comment} — {r.reviewer}
                      </Text>
                    ))
                  )}

                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13, marginTop: 8 }}>
                    Recent Rider Reviews
                  </Text>
                  {(user.riderReviews || []).length === 0 ? (
                    <Text style={{ color: M.stone500, fontSize: 11 }}>No rider reviews yet.</Text>
                  ) : (
                    (user.riderReviews || []).slice(0, 3).map((r) => (
                      <Text key={r.id} style={{ color: M.stone600, fontSize: 11, lineHeight: 16 }}>
                        <Text style={{ color: M.amber600, fontWeight: "900" }}>{r.rating}.0 ★</Text>{" "}
                        {r.comment} — {r.reviewer}
                      </Text>
                    ))
                  )}
                </View>
              </View>
            </ShellCard>
          </>
        ) : (
          <ShellCard>
            <View style={{ padding: 16 }}>
              <Text style={{ color: M.stone500, fontSize: 13 }}>Profile not available.</Text>
            </View>
          </ShellCard>
        )}
      </MockScreen>
    );
  }

  const totalSavings = pastTrips.reduce((s, t) => s + t.saved, 0);
  const displayName = realUser?.full_name || currentUser.name;
  const displayEmail = realUser?.email || currentUser.email;

  return (
    <MockScreen>
      <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>Profile</Text>

      <ShellCard>
        <View style={{ padding: 20, gap: 16, alignItems: "center" }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: M.amber400,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: M.amber200,
              shadowOpacity: 0.8,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text style={{ color: M.white, fontWeight: "900", fontSize: 28 }}>{displayName[0]}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: M.stone950 }}>{displayName}</Text>
            <Text style={{ color: M.stone500, fontSize: 13 }}>{displayEmail}</Text>
          </View>
          <TouchableOpacity onPress={() => setProfileView("connections")}>
            <Text style={{ fontSize: 13, fontWeight: "900", color: M.amber500 }}>
              {connections.length} connections
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            <RatingBadge
              label="Driver"
              rating={currentUser.driverRating}
              reviewCount={currentUser.driverReviewCount}
              ridesCompleted={currentUser.driverRidesCompleted}
            />
            <RatingBadge
              label="Rider"
              rating={currentUser.riderRating}
              reviewCount={currentUser.riderReviewCount}
              ridesCompleted={currentUser.riderRidesCompleted}
            />
          </View>
          <Text style={{ fontWeight: "600", color: M.amber500, fontSize: 13 }}>
            Total saved: ${totalSavings.toFixed(2)}
          </Text>
        </View>
      </ShellCard>

      <ShellCard>
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <UserPlus color={M.amber500} size={18} />
            <Text style={{ fontWeight: "900", color: M.stone950 }}>Add Friend</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              placeholder="Friend email"
              placeholderTextColor={M.stone400}
              autoCapitalize="none"
              value={newFriendEmail}
              onChangeText={setNewFriendEmail}
              style={[textInputStyle(), { flex: 1 }]}
            />
            <Btn onPress={addFriendFromProfile}>Add</Btn>
          </View>
        </View>
      </ShellCard>

      <ShellCard>
        <View style={{ padding: 16, gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Users color={M.amber500} size={18} />
              <Text style={{ fontWeight: "900", color: M.stone950 }}>Carpool Friends</Text>
            </View>
            <Btn onPress={() => setDriverSyncOpen(true)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              Sync
            </Btn>
          </View>

          {driverFriends.length === 0 ? (
            <Text style={{ color: M.stone500, fontSize: 11 }}>
              No carpool friends yet. Sync contacts to find friends who already have the app.
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {driverFriends.map((f) => (
                <View
                  key={f.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: M.stone50,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: RADIUS.md,
                  }}
                >
                  <Image source={{ uri: f.avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>{f.name}</Text>
                    <Text style={{ color: M.stone500, fontSize: 11 }}>{f.email}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}
          >
            <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>Folders</Text>
            <Btn
              onPress={openDriverCreateFolder}
              variant="muted"
              style={{ paddingHorizontal: 12, paddingVertical: 8 }}
            >
              New
            </Btn>
          </View>

          {driverFriendFolders.length === 0 ? (
            <Text style={{ color: M.stone500, fontSize: 11 }}>
              Create folders for activities (office, gym, weekend).
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {driverFriendFolders.map((folder) => (
                <View
                  key={folder.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: M.stone50,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: RADIUS.md,
                  }}
                >
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>{folder.name}</Text>
                  <Text style={{ fontWeight: "600", color: M.stone500, fontSize: 11 }}>
                    {folder.memberIds.length}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ShellCard>

      <ShellCard>
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {scheme === "dark" ? (
              <Moon color={M.amber500} size={18} />
            ) : (
              <Sun color={M.amber500} size={18} />
            )}
            <Text style={{ fontWeight: "900", color: M.stone950 }}>Appearance</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => setScheme("light")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: RADIUS.md,
                alignItems: "center",
                borderWidth: 1,
                borderColor: scheme === "light" ? M.amber400 : M.stone200,
                backgroundColor: scheme === "light" ? M.amber50 : M.surface,
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Sun
                color={scheme === "light" ? M.amber600 : M.stone500}
                size={16}
              />
              <Text
                style={{
                  fontWeight: "900",
                  fontSize: 13,
                  color: scheme === "light" ? M.amber700 : M.stone600,
                }}
              >
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setScheme("dark")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: RADIUS.md,
                alignItems: "center",
                borderWidth: 1,
                borderColor: scheme === "dark" ? M.amber400 : M.stone200,
                backgroundColor: scheme === "dark" ? M.amber50 : M.surface,
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Moon
                color={scheme === "dark" ? M.amber600 : M.stone500}
                size={16}
              />
              <Text
                style={{
                  fontWeight: "900",
                  fontSize: 13,
                  color: scheme === "dark" ? M.amber700 : M.stone600,
                }}
              >
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ShellCard>

      <ShellCard>
        <TouchableOpacity
          onPress={handleLogout}
          disabled={loggingOut}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: 16,
            opacity: loggingOut ? 0.6 : 1,
          }}
        >
          <LogOut color={M.amber600} size={18} />
          <Text style={{ fontWeight: "900", color: M.amber600, fontSize: 14 }}>
            {loggingOut ? "Logging out..." : "Log out"}
          </Text>
        </TouchableOpacity>
      </ShellCard>
    </MockScreen>
  );
}
