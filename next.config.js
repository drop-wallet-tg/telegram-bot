/**
 * @type {import('next').NextConfig}
 */
const config = {
	webpack: (config, { isServer }) => {
        if (!isServer) {
             config.resolve.fallback.fs = false
             config.resolve.fallback.dns = false
             config.resolve.fallback.net = false
			 config.resolve.fallback.tls = false
        }

        return config;
    },
	experimental: {
		externalDir: true,
	},
	images: {
		domains: ["t.me"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "t.me",
				port: "",
				pathname: "/u/**",
			},
		],
	},
};

module.exports = config;
