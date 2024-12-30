const NoTeamSelected = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">No Team Selected</h2>
      <p className="text-gray-600">Please select a team to view the calendar</p>
    </div>
  );
};

export default NoTeamSelected;