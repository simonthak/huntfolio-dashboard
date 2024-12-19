const NoTeamSelected = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Inget lag valt</h2>
        <p className="text-gray-600">Välj ett lag från sidomenyn för att fortsätta</p>
      </div>
    </div>
  );
};

export default NoTeamSelected;