{
  description = "Kindred Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs_20     # Specific version for Kindred
          nodePackages.typescript-language-server
          postgresql_15 # Matched to your stack
          nodePackages.npm
          railway
          nixd
        ];

        shellHook = ''
          echo "Kindred Dev Shell Loaded!"
          # Local Postgres data directory to avoid system-wide clutter
          export PGDATA="$PWD/.db"
        '';
      };
    };
}
