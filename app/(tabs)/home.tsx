import {
  Car,
  ChevronLeft,
  MoreVertical,
  Plus,
  Search,
  Users,
} from "lucide-react-native";
import React from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useApp } from "../../components/mockup/AppContext";
import { findUser } from "../../components/mockup/data";
import { M, RADIUS } from "../../components/mockup/theme";
import {
  Btn,
  DisclaimerCard,
  GroupCard,
  MockScreen,
  RideCard,
  SectionHeader,
  ShellCard,
  textInputStyle,
} from "../../components/mockup/ui";

export default function HomeScreen() {
  const {
    groups,
    users,
    ungroupedRides,
    selectedGroupId,
    setSelectedGroupId,
    joinGroup,
    openJoinRequest,
    resetCreateGroupDraft,
    setCreateGroupOpen,
    ridesByGroup,
    newMemberEmail,
    setNewMemberEmail,
    addMemberToSelectedGroup,
    removeMemberFromSelectedGroup,
    deleteGroup,
  } = useApp();

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  if (selectedGroup) {
    const selectedGroupRides = ridesByGroup[selectedGroup.id] || [];
    const selectedGroupMembers = selectedGroup.memberIds.map((id) =>
      findUser(users, id),
    );
    return (
      <MockScreen>
        <TouchableOpacity
          onPress={() => setSelectedGroupId(null)}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <ChevronLeft color={M.stone500} size={18} />
          <Text style={{ color: M.stone500, fontWeight: "700", fontSize: 13 }}>
            Your Groups
          </Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>
            {selectedGroup.name}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 13, color: M.stone500 }}>
            {selectedGroup.description}
          </Text>
        </View>

        <ShellCard>
          <View style={{ padding: 16, gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ fontWeight: "900", color: M.stone950, fontSize: 14 }}
              >
                Members
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Group Options",
                    selectedGroup.name,
                    [
                      {
                        text: "Delete Group",
                        style: "destructive",
                        onPress: () =>
                          Alert.alert(
                            "Delete Group",
                            `Delete "${selectedGroup.name}"? This cannot be undone.`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => deleteGroup(selectedGroup.id),
                              },
                            ]
                          ),
                      },
                      { text: "Cancel", style: "cancel" },
                    ]
                  )
                }
              >
                <MoreVertical color={M.amber500} size={20} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8 }}>
              {selectedGroupMembers.map((m) => (
                <View
                  key={m.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: M.stone50,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: RADIUS.md,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Image
                      source={{ uri: m.avatar }}
                      style={{ width: 36, height: 36, borderRadius: 18 }}
                    />
                    <View>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: M.stone950,
                        }}
                      >
                        {m.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: M.stone500 }}>
                        {m.email}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeMemberFromSelectedGroup(m.id)}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: M.amber600,
                      }}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                placeholder="Add member email"
                placeholderTextColor={M.stone400}
                value={newMemberEmail}
                onChangeText={setNewMemberEmail}
                style={[textInputStyle(), { flex: 1, paddingVertical: 10 }]}
                autoCapitalize="none"
              />
              <Btn onPress={addMemberToSelectedGroup}>Add</Btn>
            </View>
          </View>
        </ShellCard>

        <SectionHeader
          icon={<Car color={M.amber500} size={22} />}
          title="Shared Rides"
        />
        {selectedGroupRides.length === 0 ? (
          <ShellCard>
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: M.stone500, fontSize: 13 }}>
                No shared rides yet.
              </Text>
            </View>
          </ShellCard>
        ) : (
          selectedGroupRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              driver={findUser(users, ride.driverId)}
              onOpenJoin={openJoinRequest}
            />
          ))
        )}
      </MockScreen>
    );
  }

  return (
    <MockScreen>
      <View style={{ paddingTop: 8, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 36,
            fontWeight: "900",
            color: M.amber500,
            letterSpacing: -0.5,
          }}
        >
          CoTrip
        </Text>
        <Text style={{ marginTop: 4, fontSize: 16, color: M.stone600 }}>
          Share more. Spend less.
        </Text>
      </View>

      <DisclaimerCard />

      <View style={{ flexDirection: "row", gap: 16 }}>
        <Btn
          onPress={() => {
            resetCreateGroupDraft();
            setCreateGroupOpen(true);
          }}
          style={{ flex: 1, height: 60, gap: 8 }}
        >
          <Plus color={M.white} size={20} />
          <Text style={{ color: M.white, fontWeight: "900", fontSize: 14 }}>
            Create Group
          </Text>
        </Btn>
        <Btn style={{ flex: 1, height: 60, gap: 8 }}>
          <Search color={M.white} size={20} />
          <Text style={{ color: M.white, fontWeight: "900", fontSize: 14 }}>
            Find Rides
          </Text>
        </Btn>
      </View>

      <SectionHeader
        icon={<Users color={M.amber500} size={22} />}
        title="Your Groups"
      />
      <View style={{ gap: 12 }}>
        {groups.map((group) => {
          const members = group.memberIds.map((id) => findUser(users, id));
          return (
            <GroupCard
              key={group.id}
              group={group}
              members={members}
              onOpen={() => setSelectedGroupId(group.id)}
              onJoinGroup={joinGroup}
            />
          );
        })}
      </View>

      <SectionHeader
        icon={<Car color={M.amber500} size={22} />}
        title="Ungrouped Rides"
      />
      <View style={{ gap: 12 }}>
        {ungroupedRides.map((ride) => (
          <RideCard
            key={ride.id}
            ride={ride}
            driver={findUser(users, ride.driverId)}
            onOpenJoin={openJoinRequest}
          />
        ))}
      </View>
    </MockScreen>
  );
}
